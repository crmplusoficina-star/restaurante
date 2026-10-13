
-- Run once in the Supabase SQL editor. No customer can change restaurant settings.
create table if not exists public.menu_restaurants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  ordering_enabled boolean not null default true,
  service_percent numeric not null default 0 check (service_percent between 0 and 100),
  payment_methods text[] not null default '{}'
);
create table if not exists public.menu_products (
  restaurant_id uuid not null references public.menu_restaurants(id),
  id text not null,
  data jsonb not null,
  primary key (restaurant_id,id),
  check (jsonb_typeof(data->'price') = 'number' and (data->>'price')::numeric >= 0)
);
create table if not exists public.menu_tables (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.menu_restaurants(id),
  number text not null,
  qr_token uuid not null unique default gen_random_uuid(),
  unique(restaurant_id,number)
);
create table if not exists public.menu_sessions (
  id uuid primary key default gen_random_uuid(),
  table_id uuid not null references public.menu_tables(id),
  status text not null default 'open' check(status in ('open','bill_requested','closed')),
  opened_at timestamptz not null default now(),
  closed_at timestamptz
);
create unique index if not exists one_active_session on public.menu_sessions(table_id) where status <> 'closed';
create table if not exists public.menu_orders (
  id bigint generated always as identity primary key,
  session_id uuid not null references public.menu_sessions(id),
  request_id uuid not null,
  items jsonb not null,
  total bigint not null,
  created_at timestamptz not null default now(),
  status text not null default 'received' check(status in ('received','preparing','delivered','cancelled')),
  unique(session_id,request_id)
);
create table if not exists public.menu_bill_requests (
  session_id uuid primary key references public.menu_sessions(id),
  requested_at timestamptz not null default now(),
  status text not null default 'pending' check(status in ('pending','attending','completed'))
);
alter table public.menu_restaurants enable row level security;
alter table public.menu_products enable row level security;
alter table public.menu_tables enable row level security;
alter table public.menu_sessions enable row level security;
alter table public.menu_orders enable row level security;
alter table public.menu_bill_requests enable row level security;
revoke all on public.menu_restaurants,public.menu_products,public.menu_tables,public.menu_sessions,public.menu_orders,public.menu_bill_requests from anon,authenticated;
grant all on public.menu_restaurants,public.menu_products,public.menu_tables,public.menu_sessions,public.menu_orders,public.menu_bill_requests to service_role;
grant usage, select on sequence public.menu_orders_id_seq to service_role;

create or replace function public.customer_menu(p_restaurant_id uuid)
returns jsonb language sql stable security definer set search_path = public, pg_temp as $$
  select jsonb_build_object(
    'name',r.name,'orderingEnabled',r.ordering_enabled,
    'servicePercent',r.service_percent,'paymentMethods',r.payment_methods,
    'products',coalesce((select jsonb_agg(p.data || jsonb_build_object('id',p.id) order by p.id)
      from menu_products p where p.restaurant_id=r.id),'[]'::jsonb))
  from menu_restaurants r where r.id=p_restaurant_id
$$;

create or replace function public.customer_comanda(p_restaurant_id uuid,p_qr_token uuid)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare t menu_tables; s menu_sessions; result jsonb;
begin
  select * into t from menu_tables where qr_token=p_qr_token and restaurant_id=p_restaurant_id;
  if not found then raise exception 'QR code inválido.'; end if;
  select * into s from menu_sessions where table_id=t.id and status<>'closed';
  return jsonb_build_object('table',t.number,'sessionId',s.id,'status',coalesce(s.status,'closed'),
    'billRequested',s.status='bill_requested',
    'orders',coalesce((select jsonb_agg(jsonb_build_object('id',o.id,'table',t.number,
      'items',o.items,'createdAt',o.created_at,'status',o.status) order by o.id)
      from menu_orders o where o.session_id=s.id and o.status<>'cancelled'),'[]'::jsonb));
end $$;

create or replace function public.customer_submit_order(p_restaurant_id uuid,p_qr_token uuid,p_session_id uuid,p_request_id uuid,p_items jsonb)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare
  t menu_tables; s menu_sessions; r menu_restaurants; product jsonb; row jsonb;
  group_data jsonb; option_data jsonb; chosen jsonb; selections jsonb; items jsonb := '[]';
  unit bigint; total bigint:=0; qty integer; order_id bigint; note text; selected_id text;
begin
  select * into t from menu_tables where qr_token=p_qr_token and restaurant_id=p_restaurant_id;
  if not found then raise exception 'QR code inválido.'; end if;
  select * into s from menu_sessions where id=p_session_id and table_id=t.id for update;
  if not found then raise exception 'Comanda inválida.'; end if;
  -- Retry of the same request returns the original order without duplicating it.
  select id into order_id from menu_orders where session_id=s.id and request_id=p_request_id;
  if found then return jsonb_build_object('id',order_id); end if;
  if s.status<>'open' then raise exception 'Esta comanda não aceita novos pedidos.'; end if;
  select * into r from menu_restaurants where id=p_restaurant_id;
  if not r.ordering_enabled then raise exception 'O restaurante não está recebendo pedidos.'; end if;
  if jsonb_typeof(p_items) is distinct from 'array' or jsonb_array_length(p_items) not between 1 and 50 then
    raise exception 'Pedido inválido.'; end if;
  for row in select value from jsonb_array_elements(p_items) loop
    select data || jsonb_build_object('id',id) into product from menu_products
      where restaurant_id=p_restaurant_id and id=row->>'productId';
    if not found or product->>'available'='false' then raise exception 'Produto indisponível.'; end if;
    if coalesce(row->>'quantity','') !~ '^[1-9][0-9]?$' then raise exception 'Quantidade inválida.'; end if;
    qty:=(row->>'quantity')::integer;
    note:=coalesce(row->>'note','');
    if length(note)>120 then raise exception 'Observação muito longa.'; end if;
    selections:=coalesce(row->'selections','{}'::jsonb);
    if jsonb_typeof(selections) is distinct from 'object' then raise exception 'Opções inválidas.'; end if;
    -- Reject options that do not belong to this product.
    for selected_id in select jsonb_object_keys(selections) loop
      if not exists(select 1 from jsonb_array_elements(coalesce(product->'optionGroups','[]')) g where g->>'id'=selected_id)
      then raise exception 'Opção inválida.'; end if;
    end loop;
    unit:=(product->>'price')::bigint;
    for group_data in select value from jsonb_array_elements(coalesce(product->'optionGroups','[]')) loop
      chosen:=coalesce(selections->(group_data->>'id'),'[]'::jsonb);
      if jsonb_typeof(chosen) is distinct from 'array' then raise exception 'Opções inválidas.'; end if;
      if group_data->>'required'='true' and jsonb_array_length(chosen)=0 then raise exception 'Escolha uma opção.'; end if;
      if coalesce(group_data->>'multiple','false')<>'true' and jsonb_array_length(chosen)>1 then raise exception 'Escolha apenas uma opção.'; end if;
      if (select count(*) from jsonb_array_elements_text(chosen)) <> (select count(distinct value) from jsonb_array_elements_text(chosen)) then raise exception 'Opção repetida.'; end if;
      for selected_id in select jsonb_array_elements_text(chosen) loop
        select value into option_data from jsonb_array_elements(group_data->'options') where value->>'id'=selected_id;
        if not found then raise exception 'Opção inválida.'; end if;
        unit:=unit+coalesce((option_data->>'price')::bigint,0);
      end loop;
    end loop;
    total:=total+unit*qty;
    items:=items || jsonb_build_array(jsonb_build_object('key',coalesce(row->>'key',product->>'id'),
      'item',product,'selections',selections,'note',note,'quantity',qty,'unitPrice',unit));
  end loop;
  insert into menu_orders(session_id,request_id,items,total) values(s.id,p_request_id,items,total) returning id into order_id;
  return jsonb_build_object('id',order_id);
end $$;

create or replace function public.customer_request_bill(p_restaurant_id uuid,p_qr_token uuid,p_session_id uuid)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare s menu_sessions;
begin
  select ms.* into s from menu_sessions ms join menu_tables t on t.id=ms.table_id
    where t.restaurant_id=p_restaurant_id and t.qr_token=p_qr_token and ms.id=p_session_id for update of ms;
  if not found or s.status='closed' then raise exception 'Esta comanda está fechada.'; end if;
  if not exists(select 1 from menu_orders where session_id=s.id and status<>'cancelled') then raise exception 'A comanda está vazia.'; end if;
  insert into menu_bill_requests(session_id) values(s.id) on conflict(session_id) do nothing;
  update menu_sessions set status='bill_requested' where id=s.id;
  return jsonb_build_object('requested',true);
end $$;
revoke all on function public.customer_menu(uuid), public.customer_comanda(uuid,uuid),
 public.customer_submit_order(uuid,uuid,uuid,uuid,jsonb),public.customer_request_bill(uuid,uuid,uuid) from public;
grant execute on function public.customer_menu(uuid), public.customer_comanda(uuid,uuid),
 public.customer_submit_order(uuid,uuid,uuid,uuid,jsonb),public.customer_request_bill(uuid,uuid,uuid) to anon,authenticated;

