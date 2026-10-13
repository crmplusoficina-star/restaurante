import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import type { MenuItem } from "./menu"

export type CartItem = { key: string; item: MenuItem; selections: Record<string, string[]>; note: string; quantity: number; unitPrice: number }
type Order = { id: number; table: string; items: CartItem[]; createdAt: string; status?: string }
export type Comanda = { table: string; sessionId: string; status: "open" | "bill_requested"; billRequested: boolean; orders: Order[] }
export const table = new URLSearchParams(location.search).get("mesa")?.trim().slice(0, 40) || "1"
const storageKey = "brasa47:draft:comanda:v1:" + table
export function readComanda(): Comanda {
  const empty: Comanda = { table, sessionId: "draft-" + table, status: "open", billRequested: false, orders: [] }
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || "null")
    if (saved && saved.table === table && saved.sessionId === empty.sessionId &&
      ["open", "bill_requested"].includes(saved.status) && Array.isArray(saved.orders) &&
      saved.orders.every((order: Order) => Number.isFinite(order.id) && Array.isArray(order.items) &&
        order.items.every(row => row.item && typeof row.item.name === "string" && Number.isFinite(row.unitPrice) &&
          row.unitPrice >= 0 && Number.isInteger(row.quantity) && row.quantity > 0))) return saved
  } catch { /* Empty local tab when unavailable or corrupt. */ }
  return empty
}
export function saveComanda(next: Comanda) { localStorage.setItem(storageKey, JSON.stringify(next)) }
const money = (n: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n / 100)
export function OrderPanel({ initialView, close, cart, setCart, comanda, setComanda }: {
  initialView: "cart" | "tab"; close: () => void; cart: CartItem[]; setCart: (items: CartItem[]) => void;
  comanda: Comanda; setComanda: (value: Comanda) => void
}) {
  const dialog = useRef<HTMLDialogElement>(null)
  const [view, setView] = useState(initialView)
  const [error, setError] = useState("")
  const [confirmation, setConfirmation] = useState<number | null>(null)
  const [billConfirm, setBillConfirm] = useState(false)
  const locked = useRef(false)
  useEffect(() => {
    const previous = document.activeElement as HTMLElement
    const overflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    dialog.current?.showModal()
    return () => { document.body.style.overflow = overflow; previous?.focus() }
  }, [])
  const cartTotal = cart.reduce((sum, row) => sum + row.quantity * row.unitPrice, 0)
  const tabTotal = comanda.orders.reduce((sum, order) => sum + order.items.reduce((subtotal, row) => subtotal + row.quantity * row.unitPrice, 0), 0)
  function changeQuantity(key: string, delta: number) {
    setCart(cart.map(row => row.key === key ? { ...row, quantity: row.quantity + delta } : row).filter(row => row.quantity > 0))
  }
  function confirmOrder() {
    if (locked.current || !cart.length) return
    locked.current = true
    try {
      const current = readComanda()
      if (current.status !== "open") { setComanda(current); setError("Conta solicitada. Novos pedidos estão bloqueados."); return }
      const id = Math.max(0, ...current.orders.map(order => order.id)) + 1
      const next: Comanda = { ...current, orders: [...current.orders, { id, table, items: cart, createdAt: new Date().toISOString(), status: "received" }] }
      saveComanda(next)
      setComanda(next); setCart([]); setError(""); setConfirmation(id)
    } catch { setError("Não foi possível salvar o pedido neste navegador. Tente novamente."); }
    finally { locked.current = false }
  }
  function requestBill() {
    if (locked.current) return
    locked.current = true
    try {
      const current = readComanda()
      if (!current.orders.length) return
      const next: Comanda = { ...current, status: "bill_requested", billRequested: true }
      saveComanda(next); setComanda(next); setBillConfirm(false); setError("")
    } catch { setError("Não foi possível salvar a solicitação neste navegador. Tente novamente.") }
    finally { locked.current = false }
  }
  function choices(row: CartItem) {
    return row.item.optionGroups?.flatMap(group => (row.selections[group.id] ?? []).map(id => group.options.find(option => option.id === id)?.label)).filter(Boolean).join(" • ")
  }
  return <dialog ref={dialog} className="detail-dialog order-dialog" onCancel={close} onClick={event => { if (event.target === event.currentTarget) close() }}>
    <div className="order-heading"><div><span className="eyebrow">MESA {table}</span><h2>{confirmation ? "Pedido confirmado" : "Seu pedido e comanda"}</h2></div><button onClick={close} aria-label="Fechar pedido" className="panel-close"><X size={20}/></button></div>
    <p className="local-mode">Demonstração local • não envia pedidos à cozinha.</p>
    {confirmation ? <div className="order-confirmation"><ShoppingBag size={38}/><h3>Pedido #{confirmation} salvo</h3><p>Os itens já estão na sua comanda neste navegador.</p><button className="back-button" onClick={() => { setConfirmation(null); setView("tab") }}>Ver minha comanda</button><button className="secondary-action" onClick={close}>Continuar no cardápio</button></div> : <>
      <div className="order-tabs"><button className={view === "cart" ? "active" : ""} onClick={() => { setView("cart"); setBillConfirm(false) }}>Meu pedido ({cart.reduce((sum, row) => sum + row.quantity, 0)})</button><button className={view === "tab" ? "active" : ""} onClick={() => setView("tab")}>Minha comanda</button></div>
      <div className="order-content">
        {view === "cart" ? cart.length ? cart.map(row => <div className="order-row" key={row.key}><div className="order-row-top"><div><h3>{row.item.name}</h3>{choices(row) && <p>{choices(row)}</p>}{row.note && <p>Obs.: {row.note}</p>}</div><strong>{money(row.quantity * row.unitPrice)}</strong></div><div className="order-row-actions"><button className="remove-item" onClick={() => setCart(cart.filter(item => item.key !== row.key))} aria-label={`Remover ${row.item.name}`}><Trash2 size={14}/> Remover</button><div className="quantity-control"><button onClick={() => changeQuantity(row.key, -1)} aria-label={`Diminuir ${row.item.name}`}><Minus size={16}/></button><span>{row.quantity}</span><button onClick={() => changeQuantity(row.key, 1)} aria-label={`Aumentar ${row.item.name}`}><Plus size={16}/></button></div></div></div>) : <div className="empty-state"><ShoppingBag size={30}/><h3>Seu pedido está vazio</h3><p>Escolha um prato e toque em Adicionar.</p><button onClick={close}>Explorar cardápio</button></div> :
          comanda.orders.length ? comanda.orders.map(order => <section className="tab-order" key={order.id}><div className="tab-order-heading"><strong>Pedido #{order.id}</strong><span>{new Date(order.createdAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span></div>{order.items.map((row, index) => <div className="order-row-top tab-row" key={row.key + index}><div><h3>{row.quantity} × {row.item.name}</h3>{choices(row) && <p>{choices(row)}</p>}{row.note && <p>Obs.: {row.note}</p>}</div><strong>{money(row.quantity * row.unitPrice)}</strong></div>)}</section>) : <div className="empty-state"><ShoppingBag size={30}/><h3>Sua comanda está vazia</h3><p>Confirme um pedido para vê-lo aqui.</p></div>}
      </div>
      {error && <p className="order-error" role="alert">{error}</p>}
      {(view === "cart" ? cart.length > 0 : comanda.orders.length > 0) && <div className="order-footer"><div className="order-total"><span>{view === "cart" ? "Total do pedido" : "Total da comanda"}</span><strong>{money(view === "cart" ? cartTotal : tabTotal)}</strong></div>
        {comanda.billRequested ? <p className="bill-status" role="status">Conta solicitada. Novos pedidos estão bloqueados.</p> : view === "cart" ? <button className="back-button" onClick={confirmOrder}>Confirmar pedido <ShoppingBag size={18}/></button> : billConfirm ? <div className="bill-confirm"><p>Solicitar a conta? Depois disso, novos pedidos ficam bloqueados.</p><button className="back-button" onClick={requestBill}>Confirmar solicitação da conta</button><button className="secondary-action" onClick={() => setBillConfirm(false)}>Cancelar</button></div> : <button className="back-button" onClick={() => setBillConfirm(true)}>Pedir conta <ChevronBill/></button>}
      </div>}
    </>}
  </dialog>
}
function ChevronBill() { return <span aria-hidden="true">→</span> }
