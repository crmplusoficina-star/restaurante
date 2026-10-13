import { ArrowDown, ArrowUpRight, Flame, Search, SlidersHorizontal, Utensils, X } from "lucide-react"
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
  const search = normalize(query.trim())
  const products = menuItems.filter(item =>
    (category === "featured" ? Boolean(item.badge) && item.available !== false : item.category === category) &&
    (!availableOnly || item.available !== false) &&
    (!search || normalize(item.name + " " + item.shortDescription + " " + item.details).includes(search)))
  return <>
    <a className="skip-link" href="#cardapio">Ir para o cardápio</a>
    <header className="site-header"><a className="brand" href="#" aria-label="BRASA 47, início"><span className="brand-icon"><Flame size={24} fill="currentColor" /></span>BRASA<span className="brand-number">47</span></a><span className="header-caption">SMASH • FRITAS • BONS MOMENTOS</span><a className="header-link" href="#cardapio">Explorar cardápio <ArrowDown size={16} /></a></header>
    <main>
      <section className="hero">
        <div className="hero-copy"><span className="eyebrow"><span className="small-line" /> FEITO NA CHAPA. SEM COMPLICAÇÃO.</span><h1>Fome de<br />algo <em>bom?</em></h1><p>Smash com crosta, queijo derretido e aquele molho da casa. Escolha seu favorito e aproveite cada mordida.</p><a className="hero-cta" href="#cardapio">Encontre seu próximo favorito <ArrowDown size={18} /></a><div className="hero-footnote"><Flame size={16} /> Sabor de verdade, do primeiro ao último pedaço.</div></div>
        <div className="hero-visual"><FoodImage item={menuItems[0]} eager /><div className="hero-shade" /><span className="hero-stamp">NA CHAPA<br /><Flame size={24} /><br />NO CAPRICHO</span><div className="hero-feature"><div><span>O CLÁSSICO DA CASA</span><strong>Brasa Smash</strong></div><button onClick={() => setSelected(menuItems[0])} aria-label="Ver detalhes do Brasa Smash"><ArrowUpRight size={25} /></button></div></div>
      </section>
      <section id="cardapio" className="menu-section">
        <div className="menu-title"><div><span className="eyebrow">ESCOLHA SEM PRESSA</span><h2>Nosso cardápio<span>.</span></h2></div><p>Seu próximo favorito está aqui.</p></div>
        <div className="menu-controls"><nav aria-label="Categorias do cardápio">{categories.map(item => <button key={item.id} className={category === item.id ? "active" : ""} aria-pressed={category === item.id} onClick={() => setCategory(item.id)}>{item.id === "featured" && <Flame size={16} />}{item.label}</button>)}</nav><div className="search"><Search size={18} /><input type="search" aria-label="Buscar no cardápio" placeholder="O que você está procurando?" value={query} onChange={event => setQuery(event.target.value)} /></div></div>
        <div className="results-bar"><span aria-live="polite"><strong>{categories.find(item => item.id === category)?.label}</strong> <span className="result-count">{products.length} opções</span></span><button className={availableOnly ? "filter selected" : "filter"} aria-pressed={availableOnly} onClick={() => setAvailableOnly(!availableOnly)}><SlidersHorizontal size={15} /> Só disponíveis</button></div>
        <div className="food-grid">{products.map(item => <article className={item.available === false ? "food-card unavailable" : "food-card"} key={item.id}><button className="card-button" onClick={() => setSelected(item)} aria-label={`Ver detalhes de ${item.name}, ${money(item.price)}`}><div className="card-image"><FoodImage item={item} />{item.badge && <span className={item.available === false ? "badge sold-out" : "badge"}>{item.badge === "Bruto" ? "Bacon crocante" : item.badge}</span>}<span className="image-arrow"><ArrowUpRight size={19} /></span></div><div className="card-body"><h3>{item.name}</h3><p>{item.shortDescription}</p><div className="card-bottom"><strong>{money(item.price)}</strong><span>{item.available === false ? "Indisponível" : "Ver detalhes"}<ArrowUpRight size={14} /></span></div></div></button></article>)}</div>
        {products.length === 0 && <div className="empty-state"><Search size={30} /><h3>Nenhuma opção encontrada</h3><p>Tente outro nome ou explore as outras categorias.</p><button onClick={() => { setQuery(""); setCategory("featured"); setAvailableOnly(false) }}>Limpar filtros</button></div>}
        <div className="menu-note"><Utensils size={20} /><div><strong>Uma boa escolha começa com informação.</strong><p>Para restrições alimentares e detalhes sobre o preparo, converse com nossa equipe. Fotos ilustrativas.</p></div></div>
      </section>
    </main>
    <footer><a className="brand" href="#">BRASA<span className="brand-number">47</span></a><span>Feito na chapa. Aproveitado à mesa.</span><a href="#cardapio">Voltar ao cardápio <ArrowUpRight size={15} /></a></footer>
    {selected && <Details item={selected} close={() => setSelected(null)} />}
  </>
}
