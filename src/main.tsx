import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'

const params = new URLSearchParams(location.search)
if (params.get("app") === "operacao") {
  const role = params.get("perfil")
  location.replace("/restaurante-" + (role === "caixa" || role === "cozinha" ? role : "atendimento") + "/")
} else {
  createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>)
}
