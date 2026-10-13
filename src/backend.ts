
export type BackendConfig = { supabaseUrl: string; publicKey: string; restaurantId: string }
export async function loadBackendConfig(): Promise<BackendConfig | null> {
  const response = await fetch(new URL(/* @vite-ignore */ "../config.json", import.meta.url), { cache: "no-store" })
  if (!response.ok) throw new Error("Não foi possível carregar o cardápio.")
  const config = await response.json() as BackendConfig
  if (!config.supabaseUrl || !config.publicKey || !config.restaurantId) return null
  if (config.publicKey.startsWith("sb_secret_")) throw new Error("Configuração inválida.")
  if (!config.publicKey.startsWith("sb_publishable_")) {
    try { if (JSON.parse(atob(config.publicKey.split(".")[1])).role !== "anon") throw new Error() }
    catch { throw new Error("Configuração inválida.") }
  }
  const url = new URL(config.supabaseUrl)
  if (url.protocol !== "https:") throw new Error("Conexão inválida.")
  return config
}
export async function rpc<T>(config: BackendConfig, name: string, params: Record<string, unknown>): Promise<T> {
  const response = await fetch(config.supabaseUrl.replace(/\/$/, "") + "/rest/v1/rpc/" + name, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: config.publicKey, ...(config.publicKey.startsWith("sb_publishable_") ? {} : { Authorization: "Bearer " + config.publicKey }) },
    body: JSON.stringify(params),
    signal: AbortSignal.timeout(15000),
  })
  const body = await response.json()
  if (!response.ok) throw new Error(body.code === "P0001" ? body.message : "Não foi possível concluir a solicitação.")
  return body as T
}
