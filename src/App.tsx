import { ArrowUpRight, ChevronRight, Flame, Heart, Info, LayoutGrid, Search, SlidersHorizontal, Utensils, X } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { categories, menuItems, type MenuItem } from "./menu"

const money = (value: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value / 100)
const normalize = (text: string) => text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
function FoodImage({ item, eager = false }: { item: MenuItem; eager?: boolean }) {
  const [failed, setFailed] = useState(false)
  return failed ? <div className="image-fallback" role="img" aria-label="Foto indisponível"><Utensils size={32} /><span>{item.name}</span></div> : <img src={item.image} alt={item.imageAlt} loading={eager ? "eager" : "lazy"} onError={() => setFailed(true)} />
}
function Details({ item, close }: { item: MenuItem; close: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const previous = document.activeElement as HTMLElement
    dialog.current?.showModal()
    const overflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => { document.body.style.overflow = overflow; previous?.focus() }
  }, [])
  return <dialog ref={dialog} className="detail-dialog" onCancel={close} onClick={event => { if (event.target === event.currentTarget) close() }}>
    <div className="detail-image"><FoodImage item={item} eager /><button className="close-detail" onClick={close} aria-label="Fechar detalhes"><X /></button></div>
    <div className="detail-body"><span className="eyebrow">{categories.find(category => category.id === item.category)?.label}</span><h2>{item.name}</h2><strong className="detail-price">{money(item.price)}</strong><p>{item.details}</p>
      {item.available === false && <p className="availability">Indisponível no momento</p>}
      {item.optionGroups?.map(group => <section className="option-info" key={group.id}><h3>{group.label}</h3>{group.options.map(option => <div key={option.id}><span>{option.label.replace(" + R$ 2,00", "")}</span><span>{option.price ? `+ ${money(option.price)}` : "Incluso"}</span></div>)}</section>)}
      <div className="allergen-note"><Utensils size={18} /><p>Tem alguma restrição alimentar? Consulte a equipe sobre ingredientes e alergênicos antes de escolher.</p></div>
      <button className="back-button" onClick={close}>Voltar ao cardápio <ArrowUpRight size={18} /></button>
    </div>
  </dialog>
}

export default function App() {
  const [category, setCategory] = useState("featured")
  const [query, setQuery] = useState("")
  const [availableOnly, setAvailableOnly] = useState(false)
  const [selected, setSelected] = useState<MenuItem | null>(null)
  const [view, setView] = useState<"menu" | "favorites" | "info">("menu")
  const [favorites, setFavorites] = useState<string[]>([])
  const search = normalize(query.trim())
  const products = menuItems.filter(item =>
    (view === "favorites" ? favorites.includes(item.id) : search ? true : category === "featured" ? Boolean(item.badge) && item.available !== false : item.category === category) &&
    (!availableOnly || item.available !== false) &&
    (!search || normalize(item.name + " " + item.shortDescription + " " + item.details).includes(search)))
  function toggleFavorite(id: string) {
    setFavorites(current => current.includes(id) ? current.filter(value => value !== id) : [...current, id])
  }
  return <div className="app-shell">
    <a className="skip-link" href="#cardapio">Ir para o cardápio</a>
    <header className="app-header">
      <div className="brand"><span className="brand-icon"><Flame size={23} fill="currentColor" /></span><div><h1>BRASA <span>47</span></h1><p>Smash burgers & acompanhamentos</p></div></div>
      <button className="header-info" aria-label="Informações do cardápio" onClick={() => setView("info")}><Info size={21} /></button>
    </header>
    <main id="cardapio">
      {view !== "info" ? <>
        <div className="page-heading"><div><span className="eyebrow">{view === "favorites" ? "SUAS ESCOLHAS" : "CARDÁPIO"}</span><h2>{view === "favorites" ? "Seus favoritos" : "O que vai ser hoje?"}</h2></div><span className="menu-symbol"><Utensils size={22}/></span></div>
        <div className="search"><Search size={19}/><input type="search" aria-label="Buscar no cardápio" placeholder="Buscar burger, porção, bebida..." value={query} onChange={event => setQuery(event.target.value)} />{query && <button onClick={() => setQuery("")} aria-label="Limpar busca"><X size={17}/></button>}</div>
        {view === "menu" && <nav className="categories" aria-label="Categorias do cardápio">{categories.map(item => <button key={item.id} className={category === item.id ? "active" : ""} aria-pressed={category === item.id} onClick={() => { setCategory(item.id); setQuery("") }}>{item.id === "featured" && <Flame size={15}/>} {item.label}</button>)}</nav>}
        <div className="results-bar"><div><h3>{search ? "Resultados da busca" : view === "favorites" ? "Salvos por você" : categories.find(item => item.id === category)?.label}</h3><span aria-live="polite">{products.length} opções</span></div><button className={availableOnly ? "filter selected" : "filter"} aria-pressed={availableOnly} onClick={() => setAvailableOnly(!availableOnly)}><SlidersHorizontal size={16}/><span>Só disponíveis</span></button></div>
        <div className="food-grid">{products.map((item, index) => <article className={item.available === false ? "food-card unavailable" : "food-card"} key={item.id}>
          <button className="card-button" onClick={() => setSelected(item)} aria-label={`Ver detalhes de ${item.name}, ${money(item.price)}`}>
            <div className="card-image"><FoodImage item={item} eager={index < 4}/>{item.badge && <span className={item.available === false ? "badge sold-out" : "badge"}>{item.badge === "Bruto" ? "Bacon crocante" : item.badge}</span>}</div>
            <div className="card-body"><h3>{item.name}</h3><p>{item.shortDescription}</p><div className="card-bottom"><strong>{money(item.price)}</strong><span className="detail-arrow"><ChevronRight size={18}/></span></div></div>
          </button>
          <button className={favorites.includes(item.id) ? "favorite-button saved" : "favorite-button"} aria-label={`${favorites.includes(item.id) ? "Remover" : "Salvar"} ${item.name} ${favorites.includes(item.id) ? "dos" : "nos"} favoritos`} aria-pressed={favorites.includes(item.id)} onClick={() => toggleFavorite(item.id)}><Heart size={17} fill={favorites.includes(item.id) ? "currentColor" : "none"}/></button>
        </article>)}</div>
        {products.length === 0 && <div className="empty-state">{view === "favorites" ? <Heart size={32}/> : <Search size={32}/>}<h3>{view === "favorites" && !favorites.length ? "Seus favoritos ficam aqui" : "Nenhuma opção encontrada"}</h3><p>{view === "favorites" && !favorites.length ? "Toque no coração de um prato para guardar sua escolha." : "Tente outro nome ou explore as categorias."}</p><button onClick={() => { setQuery(""); setCategory("featured"); setAvailableOnly(false); setView("menu") }}>Explorar cardápio</button></div>}
        <p className="photo-note">Fotos ilustrativas. Consulte a equipe sobre restrições alimentares.</p>
      </> : <section className="info-page"><span className="eyebrow">BRASA 47</span><h2>Sobre o cardápio</h2><div className="info-card"><Utensils/><h3>Ingredientes e alergênicos</h3><p>Converse com a equipe antes de escolher caso tenha alergias ou restrições alimentares. As informações de alergênicos ainda não foram confirmadas.</p></div><div className="info-card"><Info/><h3>Informações dos pratos</h3><p>As fotos são ilustrativas. Abra um prato para consultar sua descrição, preço e opções de acompanhamento.</p></div><div className="info-card"><Heart/><h3>Suas escolhas</h3><p>Os favoritos ajudam a comparar os pratos enquanto você navega. Eles ficam disponíveis durante esta visita.</p></div></section>}
    </main>
    <nav className="bottom-nav" aria-label="Navegação principal">
      <button className={view === "menu" ? "active" : ""} aria-current={view === "menu" ? "page" : undefined} onClick={() => setView("menu")}><LayoutGrid size={21}/><span>Cardápio</span></button>
      <button className={view === "favorites" ? "active" : ""} aria-current={view === "favorites" ? "page" : undefined} onClick={() => { setView("favorites"); setQuery("") }}><span className="nav-icon"><Heart size={21}/>{favorites.length > 0 && <span className="favorites-count" aria-hidden="true">{favorites.length}</span>}</span><span>Favoritos</span></button>
      <button className={view === "info" ? "active" : ""} aria-current={view === "info" ? "page" : undefined} onClick={() => setView("info")}><Info size={21}/><span>Informações</span></button>
    </nav>
    {selected && <Details item={selected} close={() => setSelected(null)} />}
  </div>
}
