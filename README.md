# Cardápio do cliente

Este repositório contém apenas o app usado pelo cliente na mesa. Os apps de cozinha, atendente e administrador serão separados.

## Estado atual: rascunho local

O cardápio publicado está em modo local (`DRAFT_MODE = true` em `src/App.tsx`). Não consulta nem grava no Supabase. Confirmar pedido acrescenta os itens à comanda no armazenamento deste navegador, separado pelo parâmetro `?mesa=5`; sem parâmetro, utiliza a mesa 1 no rascunho. Não há seletor de mesa para o cliente.

Pedir conta também é local e bloqueia novos pedidos dessa comanda. Os dados sobrevivem ao recarregamento, mas não são compartilhados entre celulares. O fluxo não envia pedidos para a cozinha.

A estrutura existente no projeto Artemis foi preservada. A futura ativação exige definir `DRAFT_MODE = false`, preencher a conexão abaixo e cadastrar mesas e sessões. Não use o modo local como fallback de falhas em produção.

## Ativação futura no Supabase

1. Execute `supabase/customer-menu.sql` no SQL Editor do projeto.
2. Execute `supabase/seed-menu.sql` para cadastrar o catálogo inicial. O seed preserva registros existentes.
3. Configure `public/config.json`:
   - `supabaseUrl`: URL HTTPS do projeto.
   - `publicKey`: chave publishable (`sb_publishable_...`) ou anon legada.
   - `restaurantId`: UUID do restaurante. O seed usa `47470000-0000-4000-8000-000000000001`.
4. Publique novamente.

Nunca coloque uma chave secret ou service_role no app do cliente. O cliente não recebe permissões para alterar produtos, encerrar comandas, abrir mesas ou mudar configurações.

## Mesa e QR code

O QR code contém `?token=<qr_token>`. O número da mesa é resolvido no servidor; `?mesa=5` sozinho não autoriza pedidos.

Cadastro de uma mesa pelo ambiente administrativo:

```sql
insert into public.menu_tables(restaurant_id,number)
values ('47470000-0000-4000-8000-000000000001','5')
returning id,number,qr_token;
```

Abertura de uma comanda pelo atendente, usando o ID retornado:

```sql
insert into public.menu_sessions(table_id) values ('ID_DA_MESA');
```

Encerramento pelo atendente:

```sql
update public.menu_sessions set status='closed',closed_at=now()
where id='ID_DA_COMANDA';
```

Uma nova sessão não herda pedidos da sessão anterior. O cliente não tem um endpoint para abrir ou encerrar sessões.

## Integração dos outros apps

- Cozinha: lê `menu_orders`, vinculada à sessão em `menu_sessions` e à mesa em `menu_tables`.
- Atendente: lê `menu_bill_requests`, atende a solicitação e encerra a sessão.
- Administrador: configura `menu_restaurants.ordering_enabled`, `service_percent`, `payment_methods` e os produtos.
- Os apps futuros precisam de autenticação e permissões de equipe no servidor. A migration concede acesso administrativo apenas a `service_role`, para uso no servidor, não em outro frontend público.

RPCs exclusivos do cliente:
- `customer_menu`: produtos e configurações públicas.
- `customer_comanda`: comanda da sessão ativa do QR.
- `customer_submit_order`: valida sessão, disponibilidade, quantidades e opções, calcula preços no servidor e registra o pedido.
- `customer_request_bill`: registra a solicitação uma única vez e bloqueia novos pedidos nessa sessão.

A comanda e o catálogo são consultados a cada 5 segundos. A confirmação depende do recebimento no banco. Repetir uma solicitação com o mesmo identificador não duplica o pedido.

## Ingredientes e alergênicos

Os produtos aceitam `ingredients: string[]`, `allergens: string[]` e `allergenInfoConfirmed: boolean` dentro de `menu_products.data`. Cadastre os dados verificados da receita. O catálogo inicial não inventa alergênicos: quando faltam dados confirmados, o cliente é orientado a consultar a equipe.

Taxa de serviço e pagamentos só aparecem quando cadastrados pelo administrador. Não há telas de configuração no cardápio.

## Verificação

```sh
npm install
npm test
npm run build
```

Os testes executam as funções SQL em PostgreSQL via PGlite e cobrem permissões, preços no servidor, idempotência, QR inválido, produtos esgotados, restaurante fechado, opções, pedido de conta e encerramento de sessão.

Sem configuração de Supabase, o catálogo inicial pode ser consultado, mas os pedidos não são confirmados nem salvos como se tivessem sido enviados.

