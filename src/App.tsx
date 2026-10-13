import {
  Check,
  Flame,
  Minus,
  Plus,
  ShoppingBag,
  Store,
  Trash2,
  X,
} from "lucide-react"
import {
  type ButtonHTMLAttributes,
  type ReactNode,
  type TextareaHTMLAttributes,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react"

type CategoryId = "featured" | "smash" | "combos" | "sides" | "drinks"

type MenuOption = {
  id: string
  label: string
  price: number
}

type OptionGroup = {
  id: string
  label: string
  required?: boolean
  multiple?: boolean
  defaultOptionId?: string
  options: MenuOption[]
}

type MenuItem = {
  id: string
  category: Exclude<CategoryId, "featured">
  name: string
  shortDescription: string
  details: string
  price: number
  image: string
  imageAlt: string
  badge?: string
  available?: boolean
  spicy?: boolean
  optionGroups?: OptionGroup[]
}

type CartItem = {
  key: string
  item: MenuItem
  selections: Record<string, string[]>
  note: string
  quantity: number
  unitPrice: number
}

const categories: { id: CategoryId; label: string }[] = [
  { id: "featured", label: "Destaques" },
  { id: "smash", label: "Smash burgers" },
  { id: "combos", label: "Combos" },
  { id: "sides", label: "Porções" },
  { id: "drinks", label: "Bebidas" },
]

const menuItems: MenuItem[] = [
  {
    id: "brasa-smash",
    category: "smash",
    name: "Brasa Smash",
    shortDescription: "Carne, queijo e molho da casa em pão brioche.",
    details:
      "Carne prensada na chapa, queijo derretido, cebola roxa e molho BRASA em pão brioche com toque de alho e mostarda.",
    price: 2690,
    image:
      "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Hambúrguer artesanal com queijo e molho",
    badge: "Mais pedido",
    available: true,
  },
  {
    id: "duplo-47",
    category: "smash",
    name: "Duplo 47",
    shortDescription: "Duas carnes e picles agridoce em sabor intenso.",
    details:
      "Dois smash no pão brioche, queijo, picles e molho defumado com acidez equilibrada para um sabor urbano e direto.",
    price: 3590,
    image:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Duplo hambúrguer com queijo e picles",
    badge: "Novo",
    available: true,
  },
  {
    id: "bacon-na-chapa",
    category: "smash",
    name: "Bacon na Chapa",
    shortDescription: "Bacon crocante, cheddar e cebola caramelizada.",
    details:
      "Smash com bacon dourado na chapa, cheddar cremoso e cebola caramelizada para um sabor mais encorpado e com crosta.",
    price: 3190,
    image:
      "https://images.unsplash.com/photo-1520072959219-c595dc870360?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Cheeseburger com bacon e cebola caramelizada",
    badge: "Bruto",
    available: true,
  },
  {
    id: "veggie-de-rua",
    category: "smash",
    name: "Veggie de Rua",
    shortDescription: "Burger vegetal com rúcula e maionese verde.",
    details:
      "Burger de cogumelos e grão de bico com queijo, rúcula, tomate e maionese de ervas para quem quer um smash sem carne.",
    price: 2890,
    image:
      "https://images.unsplash.com/photo-1512152272829-e3139592d56f?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Hambúrguer vegetariano com folhas e tomate",
    badge: "Esgotado",
    available: false,
  },
  {
    id: "combo-duplo",
    category: "combos",
    name: "Combo Duplo + fritas",
    shortDescription: "Duplo 47 com fritas e bebida gelada.",
    details:
      "Duplo 47 com fritas da casa e bebida na escolha. A melhor combinação para fome de rua com ritmo de almoço.",
    price: 4890,
    image:
      "https://images.unsplash.com/photo-1550317138-10000687a72b?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Combo de hambúrguer com fritas e bebida",
    badge: "Economize",
    available: true,
    optionGroups: [
      {
        id: "drink",
        label: "Escolha a bebida",
        required: true,
        defaultOptionId: "cola",
        options: [
          { id: "cola", label: "Cola 350 ml", price: 0 },
          { id: "mate", label: "Mate com limão", price: 200 },
          { id: "water", label: "Água com gás", price: 0 },
        ],
      },
    ],
  },
  {
    id: "combo-brasa",
    category: "combos",
    name: "Combo Brasa",
    shortDescription: "Brasa Smash, fritas e bebida gelada.",
    details:
      "O clássico BRASA com smash, fritas crocantes e bebida na escolha. Direto, equilibrado e por uma boa razão.",
    price: 3990,
    image:
      "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Combo de hambúrguer com fritas numa mesa",
    available: true,
    optionGroups: [
      {
        id: "drink",
        label: "Escolha a bebida",
        required: true,
        defaultOptionId: "cola",
        options: [
          { id: "cola", label: "Cola 350 ml", price: 0 },
          { id: "mate", label: "Mate com limão", price: 200 },
          { id: "water", label: "Água com gás", price: 0 },
        ],
      },
    ],
  },
  {
    id: "fritas-da-casa",
    category: "sides",
    name: "Fritas da Casa",
    shortDescription: "Fritas crocantes com sal de páprica.",
    details:
      "Porção generosa de fritas douradas e crocantes, finalizadas com sal de páprica e maionese de alho.",
    price: 1690,
    image:
      "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Porção de batatas fritas douradas",
    badge: "Para dividir",
    available: true,
  },
  {
    id: "onion-rings",
    category: "sides",
    name: "Onion Rings Picantes",
    shortDescription: "Anéis de cebola crocantes e quentes.",
    details:
      "Anéis de cebola empanados, crocantes por fora e em textura macia por dentro, com tempero quente da casa.",
    price: 1890,
    image:
      "https://images.unsplash.com/photo-1639024471283-03518883512d?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Porção de anéis de cebola empanados",
    badge: "Picante",
    spicy: true,
    available: true,
  },
  {
    id: "mate-limon",
    category: "drinks",
    name: "Mate com Limão",
    shortDescription: "Cítrico e refrescante para acompanhar os smash.",
    details:
      "Mate gelado com limão espremido, pouca doçura e acidez equilibrada para um fechamento leve.",
    price: 900,
    image:
      "https://images.unsplash.com/photo-1497534446932-c925b458314e?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Copo de bebida gelada com limão",
    available: true,
    optionGroups: [
      {
        id: "size",
        label: "Tamanho",
        required: true,
        defaultOptionId: "medium",
        options: [
          { id: "medium", label: "300 ml", price: 0 },
          { id: "large", label: "500 ml + R$ 2,00", price: 200 },
        ],
      },
    ],
  },
  {
    id: "cola",
    category: "drinks",
    name: "Cola",
    shortDescription: "Refrigerante clássico gelado.",
    details:
      "Lata 350 ml, bem gelada e pronta para combinar com a crosta dos smash e o sal das fritas.",
    price: 700,
    image:
      "https://images.unsplash.com/photo-1622483767028-3f66f2aef2f3?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Lata de refrigerante gelada",
    available: true,
  },
  {
    id: "agua-com-gas",
    category: "drinks",
    name: "Água com Gás",
    shortDescription: "Gelada e leve para o momento de rua.",
    details:
      "Água mineral com gás, garrafa 500 ml, servida gelada para refrescar sem perder a sequência do pedido.",
    price: 600,
    image:
      "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Garrafa de água com gás",
    available: true,
  },
]

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
})

function formatPrice(value: number) {
  return currencyFormatter.format(value / 100)
}

function Button({
  children,
  className = "",
  variant = "primary",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode
  variant?: "primary" | "secondary" | "ghost"
}) {
  const styles = {
    primary: "bg-action text-ink-inverse shadow-card hover:bg-action-strong",
    secondary:
      "border border-line/70 bg-surface text-ink hover:border-action/70 hover:text-action",
    ghost: "border border-line/70 bg-transparent text-ink-muted hover:border-line hover:text-ink",
  }

  return (
    <button
      className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-4 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action/60 disabled:cursor-not-allowed disabled:opacity-50 ${styles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

function IconButton({
  label,
  children,
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string
  children: ReactNode
}) {
  return (
    <button
      aria-label={label}
      title={label}
      className={`inline-flex size-11 items-center justify-center rounded-full border border-line/70 bg-surface text-ink transition-colors hover:border-action/70 hover:text-action focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action/60 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className="min-h-24 w-full resize-none rounded-xl border border-line bg-surface-raised px-3 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-ink-faint focus:border-action focus:ring-2 focus:ring-action/20"
      {...props}
    />
  )
}

function FoodImage({
  src,
  alt,
  className,
  eager = false,
}: {
  src: string
  alt: string
  className: string
  eager?: boolean
}) {
  const [failed, setFailed] = useState(false)

  if (failed) {
    return (
      <div
        aria-label={`${alt} — imagem indisponível`}
        className={`grid place-items-center bg-surface-raised text-ink-faint ${className}`}
        role="img"
      >
        <Store aria-hidden="true" size={28} />
      </div>
    )
  }

  return (
    <img
      alt={alt}
      className={className}
      decoding="async"
      loading={eager ? "eager" : "lazy"}
      onError={() => setFailed(true)}
      src={src}
    />
  )
}


type TableOrder = { id: number; table: string; items: CartItem[]; createdAt: string }
const storageKey = "brasa47:orders:v1"
function readOrders(): TableOrder[] {
  try {
    const rows: unknown = JSON.parse(localStorage.getItem(storageKey) ?? "[]")
    return Array.isArray(rows) ? rows.filter((row): row is TableOrder => row &&
      Number.isInteger(row.id) && typeof row.table === "string" && Array.isArray(row.items) &&
      row.items.every((item: CartItem) => item?.item && typeof item.item.name === "string" &&
        Number.isFinite(item.unitPrice) && Number.isInteger(item.quantity) && item.quantity > 0)) : []
  } catch { return [] }
}

function Sheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
}) {
  const titleId = useId()
  const panelRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!open) return

    const previousFocus = document.activeElement as HTMLElement | null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    panelRef.current?.focus()

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose()
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener("keydown", handleKeyDown)
      previousFocus?.focus()
    }
  }, [onClose, open])

  if (!open) return null

  return (
    <div className="modal-backdrop">
      <div
        aria-hidden="true"
        className="absolute inset-0"
        onClick={onClose}
      />
      <div
        aria-labelledby={titleId}
        aria-modal="true"
        className="modal-panel"
        onClick={(event) => event.stopPropagation()}
        ref={panelRef}
        role="dialog"
        tabIndex={-1}
      >
        <div className="modal-heading">
          <h2 className="font-display text-2xl font-bold text-ink" id={titleId}>
            {title}
          </h2>
          <IconButton label="Fechar" onClick={onClose}>
            <X aria-hidden="true" size={18} />
          </IconButton>
        </div>
        {children}
      </div>
    </div>
  )
}


function MenuCard({item, onSelect}: {item: MenuItem; onSelect: (item: MenuItem) => void}) {
  const available = item.available !== false
  return <article className={`food-card ${available ? "" : "unavailable"}`}>
    <button className="food-photo" aria-label={`Ver ${item.name}`} onClick={() => onSelect(item)} disabled={!available}>
      <FoodImage src={item.image} alt={item.imageAlt} className="food-photo-img" />
      {item.badge && <span className="food-tag">{item.badge}</span>}
    </button>
    <div className="food-info"><h3>{item.name}</h3><p>{item.shortDescription}</p>
      <div className="food-actions"><strong>{formatPrice(item.price)}</strong>
        <button className="add-button" disabled={!available} onClick={() => onSelect(item)}><Plus size={17} />{available ? "Adicionar" : "Esgotado"}</button>
      </div>
    </div>
  </article>
}
function App() {
  const [activeCategory, setActiveCategory] = useState<CategoryId>("featured")
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null)
  const [selections, setSelections] = useState<Record<string, string[]>>({})
  const [note, setNote] = useState("")
  const [cart, setCart] = useState<CartItem[]>([])
  const [cartOpen, setCartOpen] = useState(false)
  const [table, setTable] = useState(() => new URLSearchParams(location.search).get("mesa") ?? "")
  const [tableDraft, setTableDraft] = useState(table)
  const [tableOpen, setTableOpen] = useState(false)
  const [view, setView] = useState<"cart" | "tab">("cart")
  const [saveError, setSaveError] = useState("")
  const [orders, setOrders] = useState<TableOrder[]>(readOrders)
  const tableOrders = orders.filter(order => order.table === table)
  const tabTotal = tableOrders.reduce((sum, order) => sum + order.items.reduce((s, item) => s + item.quantity * item.unitPrice, 0), 0)
  const [orderNumber, setOrderNumber] = useState<number | null>(null)

  const visibleItems = useMemo(
    () =>
      activeCategory === "featured"
        ? menuItems.filter((item) => item.badge || item.name.includes("Brasa"))
        : menuItems.filter((item) => item.category === activeCategory),
    [activeCategory],
  )

  const draftOptionValues = useMemo(() => {
    if (!selectedItem) return [] as MenuOption[]

    return (
      selectedItem.optionGroups?.flatMap((group) =>
        (selections[group.id] ?? [])
          .map((id) => group.options.find((option) => option.id === id))
          .filter((option): option is MenuOption => Boolean(option)),
      ) ?? []
    )
  }, [selectedItem, selections])

  const draftTotal = (selectedItem?.price ?? 0) + draftOptionValues.reduce((sum, option) => sum + option.price, 0)

  const cartSubtotal = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
  const cartTotal = cartSubtotal
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  const requiredComplete =
    selectedItem?.optionGroups?.filter((group) => group.required).every((group) => (selections[group.id]?.length ?? 0) > 0) ?? true

  function openItem(item: MenuItem) {
    if (item.available === false) return

    const defaults: Record<string, string[]> = {}
    item.optionGroups?.filter((group) => group.id === "drink" || group.id === "size").forEach((group) => {
      const defaultId = group.defaultOptionId ?? (group.required ? group.options[0]?.id : undefined)
      if (defaultId) defaults[group.id] = [defaultId]
      else defaults[group.id] = []
    })

    setSelections(defaults)
    setNote("")
    setSelectedItem(item)
  }

  function closeItem() {
    setSelectedItem(null)
    setSelections({})
    setNote("")
  }

  function toggleOption(group: OptionGroup, optionId: string) {
    setSelections((current) => {
      const currentValues = current[group.id] ?? []

      if (group.multiple) {
        return {
          ...current,
          [group.id]: currentValues.includes(optionId)
            ? currentValues.filter((value) => value !== optionId)
            : [...currentValues, optionId],
        }
      }

      return { ...current, [group.id]: [optionId] }
    })
  }

  function addSelectedToCart() {
    if (!selectedItem || !requiredComplete) return

    const selectionKey = Object.entries(selections)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([groupId, selected]) => `${groupId}:${selected.join(",")}`)
      .join("|")

    const key = `${selectedItem.id}|${selectionKey}|${note.trim()}`

    setCart((current) => {
      const existing = current.find((item) => item.key === key)

      if (existing) {
        return current.map((item) =>
          item.key === key ? { ...item, quantity: item.quantity + 1 } : item,
        )
      }

      return [
        ...current,
        {
          key,
          item: selectedItem,
          selections,
          note: note.trim(),
          quantity: 1,
          unitPrice: draftTotal,
        },
      ]
    })

    closeItem()
  }

  function changeQuantity(key: string, delta: number) {
    setCart((current) =>
      current
        .map((item) =>
          item.key === key ? { ...item, quantity: item.quantity + delta } : item,
        )
        .filter((item) => item.quantity > 0),
    )
  }

  function removeCartItem(key: string) {
    setCart((current) => current.filter((item) => item.key !== key))
  }

  function describeSelection(item: CartItem) {
    return item.item.optionGroups
      ?.flatMap((group) => (item.selections[group.id] ?? []).map((optionId) => {
        const selectedOption = group.options.find((option) => option.id === optionId)
        return selectedOption?.label
      }))
      .filter(Boolean)
      .join(" • ")
  }

  function completeOrder() {
    if (cart.length === 0) return
    if (!/^[1-9]\d{0,2}$/.test(table)) { setTableOpen(true); return }
    const latest = readOrders()
    const id = latest.reduce((max, row) => Math.max(max, row.id), 0) + 1
    const next = [...latest, { id, table, items: cart, createdAt: new Date().toISOString() }]
    try { localStorage.setItem(storageKey, JSON.stringify(next)) }
    catch { setSaveError("Não foi possível salvar a comanda. Tente novamente."); return }
    setOrders(next); setCart([]); setSaveError(""); setOrderNumber(id)
  }

  function finishConfirmation() {
    setOrderNumber(null)
    setCartOpen(false)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }


  return (
    <div className="restaurant-app">
      <header className="site-header"><div className="header-inner">
        <a className="restaurant-brand" href="#cardapio"><span className="brand-mark"><Flame size={26}/></span>
          <span><h1>BRASA 47</h1><span className="brand-caption">Hamburgueria</span></span>
        </a>
        <div className="app-brand"><span className="app-dot"/>Mesa<span className="app-caption">cardápio digital</span></div>
        <button className="table-button" onClick={() => { setTableDraft(table); setTableOpen(true) }}><Store size={16}/>{table ? `Mesa ${table}` : "Selecionar mesa"}</button>
      </div></header>
      <main id="cardapio" className="menu-shell">
        <div className="menu-toolbar">
          <nav className="category-nav" aria-label="Categorias do cardápio">
            {categories.map(category => <button key={category.id} aria-pressed={activeCategory === category.id}
              className={activeCategory === category.id ? "active" : ""}
              onClick={() => setActiveCategory(category.id)}>{category.label}</button>)}
          </nav>
          <button className="tab-link" onClick={() => { setView("tab"); setOrderNumber(null); setCartOpen(true) }}>Minha comanda <span>{formatPrice(tabTotal)}</span></button>
        </div>
        <div className="section-heading"><h2>{categories.find(category => category.id === activeCategory)?.label}</h2><span>{visibleItems.length} opções</span></div>
        <div className="food-grid">{visibleItems.map(item => <MenuCard key={item.id} item={item} onSelect={openItem}/>)}</div>
      </main>
      <div className="order-dock"><div className="dock-inner">
        <div><span className="dock-caption">{cartCount ? `${cartCount} ${cartCount === 1 ? "item no pedido" : "itens no pedido"}` : "Comanda da mesa"}</span><strong>{formatPrice(cartCount ? cartTotal : tabTotal)}</strong></div>
        <button className="primary-button" onClick={() => { setView(cartCount ? "cart" : "tab"); setOrderNumber(null); setCartOpen(true) }}><ShoppingBag size={18}/>{cartCount ? "Ver pedido" : "Ver comanda"}</button>
      </div></div>
      <Sheet open={Boolean(selectedItem)} onClose={closeItem} title={selectedItem?.name ?? "Detalhes do item"}>
        {selectedItem ? (
          <>
            <div className="modal-scroll">
              <FoodImage
                alt={selectedItem.imageAlt}
                className="detail-photo"
                src={selectedItem.image}
              />

              <div className="detail-content space-y-6">
                <div className="flex items-start justify-between gap-3">
                  <p className="max-w-[70%] text-sm leading-6 text-ink-muted">
                    {selectedItem.shortDescription}
                  </p>
                  <span className="font-bold text-action tabular-nums">
                    {formatPrice(selectedItem.price)}
                  </span>
                </div>

                {selectedItem.optionGroups?.filter((group) => group.id === "drink" || group.id === "size").map((group) => (
                  <fieldset key={group.id} className="space-y-3">
                    <legend className="flex w-full items-center justify-between text-sm font-semibold text-ink">
                      <span>{group.label}</span>
                      {group.required ? (
                        <span className="text-[10px] uppercase tracking-[0.18em] text-action">
                          Obrigatório
                        </span>
                      ) : null}
                    </legend>

                    {group.options.map((option) => {
                      const checked = (selections[group.id] ?? []).includes(option.id)

                      return (
                        <label
                          className={`flex min-h-11 cursor-pointer items-center justify-between gap-3 rounded-2xl border px-3 py-2.5 ${
                            checked ? "border-action bg-action-subtle" : "border-line bg-surface"
                          }`}
                          key={option.id}
                        >
                          <span className="flex items-center gap-3 text-sm text-ink">
                            <input
                              checked={checked}
                              className="h-4 w-4 accent-action"
                              name={group.id}
                              onChange={() => toggleOption(group, option.id)}
                              type={group.multiple ? "checkbox" : "radio"}
                            />
                            {option.label}
                          </span>
                          <span className="text-xs font-semibold text-ink-muted">
                            {option.price > 0 ? `+ ${formatPrice(option.price)}` : "Incluso"}
                          </span>
                        </label>
                      )
                    })}
                  </fieldset>
                ))}

                <div>
                  <label className="mb-2 block font-semibold text-ink" htmlFor="item-note">
                    Observação (opcional)
                  </label>
                  <TextArea
                    id="item-note"
                    maxLength={120}
                    onChange={(event) => setNote(event.target.value)}
                    placeholder="Sem cebola, molho à parte ..."
                    value={note}
                  />
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <Button
                className="w-full justify-between gap-3"
                disabled={!requiredComplete}
                onClick={addSelectedToCart}
              >
                <span>Adicionar ao pedido</span>
                <span>{formatPrice(draftTotal)}</span>
              </Button>
            </div>
          </>
        ) : null}
      </Sheet>


      <Sheet open={cartOpen} onClose={() => setCartOpen(false)} title={table ? `Mesa ${table}` : "Seu pedido"}>
        {orderNumber ? <>
          <div className="modal-scroll confirmation">
            <span className="confirmation-icon"><Check size={30}/></span><h3>Adicionado à comanda</h3><p>Pedido #{orderNumber}</p>
            <div className="confirmation-total"><span>Total da mesa</span><strong>{formatPrice(tabTotal)}</strong></div>
          </div>
          <div className="modal-footer"><button className="primary-button full-button" onClick={finishConfirmation}>Continuar pedindo</button></div>
        </> : <>
          <div className="order-tabs"><button className={view === "cart" ? "active" : ""} onClick={() => setView("cart")}>Novo pedido {cartCount > 0 && <span>{cartCount}</span>}</button>
            <button className={view === "tab" ? "active" : ""} onClick={() => setView("tab")}>Comanda</button></div>
          <div className="modal-scroll order-content">
            {view === "cart" ? cart.length ? cart.map(item => <article className="order-row" key={item.key}>
              <div className="order-row-top"><div><h3>{item.item.name}</h3><p>{[describeSelection(item), item.note].filter(Boolean).join(" · ")}</p></div><strong>{formatPrice(item.unitPrice * item.quantity)}</strong></div>
              <div className="order-row-actions"><button className="text-button" onClick={() => removeCartItem(item.key)}><Trash2 size={14}/>Remover</button>
                <div className="quantity-control"><button aria-label={`Diminuir ${item.item.name}`} onClick={() => changeQuantity(item.key, -1)}><Minus size={16}/></button>
                  <span>{item.quantity}</span><button aria-label={`Aumentar ${item.item.name}`} onClick={() => changeQuantity(item.key, 1)}><Plus size={16}/></button></div>
              </div>
            </article>) : <div className="empty-state"><ShoppingBag size={32}/><h3>Escolha o que vai pedir</h3><p>Seus itens aparecem aqui.</p></div>
            : tableOrders.length ? tableOrders.map(order => <section className="tab-order" key={order.id}>
              <div className="tab-order-heading"><span>Pedido #{order.id}</span><time>{new Date(order.createdAt).toLocaleTimeString("pt-BR", {hour:"2-digit",minute:"2-digit"})}</time></div>
              {order.items.map(item => <div className="tab-line" key={item.key}><div><h3>{item.quantity} × {item.item.name}</h3><p>{[describeSelection(item), item.note].filter(Boolean).join(" · ")}</p></div><strong>{formatPrice(item.unitPrice * item.quantity)}</strong></div>)}
            </section>) : <div className="empty-state"><ShoppingBag size={32}/><h3>{table ? "Sua comanda está aberta" : "Selecione sua mesa"}</h3><p>{table ? "Os pedidos confirmados se acumulam aqui." : "Informe a mesa para consultar a comanda."}</p></div>}
          </div>
          <div className="modal-footer"><div className="order-total"><span>{view === "cart" ? "Total deste pedido" : "Total da comanda"}</span><strong>{formatPrice(view === "cart" ? cartTotal : tabTotal)}</strong></div>
            {saveError && <p role="alert" className="save-error">{saveError}</p>}
            {view === "cart" && cart.length ? <button className="primary-button full-button" onClick={completeOrder}>{table ? "Confirmar pedido" : "Selecionar mesa e confirmar"}</button>
            : !table ? <button className="primary-button full-button" onClick={() => setTableOpen(true)}>Selecionar mesa</button>
            : <button className="primary-button full-button" onClick={() => setCartOpen(false)}>Continuar pedindo</button>}
          </div>
        </>}
      </Sheet>
      <Sheet open={tableOpen} onClose={() => setTableOpen(false)} title="Qual é a sua mesa?">
        <div className="modal-scroll table-form"><label htmlFor="table-number">Número da mesa</label>
          <input id="table-number" type="number" min="1" max="999" inputMode="numeric" placeholder="Ex.: 12" value={tableDraft} onChange={event => setTableDraft(event.target.value)}/></div>
        <div className="modal-footer"><button className="primary-button full-button" disabled={!/^[1-9]\d{0,2}$/.test(tableDraft)} onClick={() => {
          setTable(tableDraft); setTableOpen(false);
          const url = new URL(location.href); url.searchParams.set("mesa", tableDraft); window.history.replaceState(null, "", url)
        }}>Usar esta mesa</button></div>
      </Sheet>
    </div>
  )
}
export default App
