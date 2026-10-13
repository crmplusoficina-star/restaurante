
import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import { PGlite } from "@electric-sql/pglite"
const db = new PGlite()
const restaurant = "47470000-0000-4000-8000-000000000001"
const table = "47470000-0000-4000-8000-000000000002"
const token = "47470000-0000-4000-8000-000000000003"
const session = "47470000-0000-4000-8000-000000000004"
const request = "47470000-0000-4000-8000-000000000005"
const product = {name:"Burger",price:1000,available:true,optionGroups:[{id:"drink",required:true,options:[{id:"cola",label:"Cola",price:200}]}]}
try {
 await db.exec("create role anon; create role authenticated; create role service_role;")
 await db.exec(await readFile(new URL("../supabase/customer-menu.sql",import.meta.url),"utf8"))
 await db.query("insert into menu_restaurants(id,name) values($1,'Restaurant')",[restaurant])
 await db.query("insert into menu_products values($1,'burger',$2)",[restaurant,JSON.stringify(product)])
 await db.query("insert into menu_tables(id,restaurant_id,number,qr_token) values($1,$2,'5',$3)",[table,restaurant,token])
 await db.query("insert into menu_sessions(id,table_id) values($1,$2)",[session,table])
 await db.exec("set role anon")
 await assert.rejects(()=>db.query("select * from menu_orders"),/permission denied/)
 await assert.rejects(()=>db.query("update menu_restaurants set service_percent=100"),/permission denied/)
 const args=[restaurant,token,session,request,JSON.stringify([{productId:"burger",quantity:2,unitPrice:1,selections:{drink:["cola"]}}])]
 const submit=()=>db.query("select customer_submit_order($1,$2,$3,$4,$5) as result",args)
 const first=await submit()
 const retry=await submit()
 assert.equal(first.rows[0].result.id,retry.rows[0].result.id)
 const snapshot=await db.query("select customer_comanda($1,$2) as result",[restaurant,token])
 assert.equal(snapshot.rows[0].result.orders.length,1)
 assert.equal(snapshot.rows[0].result.orders[0].items[0].unitPrice,1200)
 await assert.rejects(()=>db.query("select customer_comanda($1,$2)",[restaurant,"47470000-0000-4000-8000-000000000099"]),/QR code inválido/)
 await db.exec("reset role")
 await db.query("update menu_products set data=jsonb_set(data,'{available}','false') where id='burger'")
 args[3]="47470000-0000-4000-8000-000000000006"
 await db.exec("set role anon")
 await assert.rejects(submit,/Produto indisponível/)
 await db.exec("reset role")
 await db.query("update menu_products set data=jsonb_set(data,'{available}','true')")
 await db.query("update menu_restaurants set ordering_enabled=false")
 await db.exec("set role anon")
 await assert.rejects(submit,/não está recebendo/)
 await db.exec("reset role")
 await db.query("update menu_restaurants set ordering_enabled=true")
 await db.exec("set role anon")
 args[4]=JSON.stringify([{productId:"burger",quantity:1,selections:{drink:["invalid"]}}])
 await assert.rejects(submit,/Opção inválida/)
 args[4]=JSON.stringify([{productId:"burger",quantity:1,selections:{}}])
 await assert.rejects(submit,/Escolha uma opção/)
 await db.query("select customer_request_bill($1,$2,$3)",[restaurant,token,session])
 await db.query("select customer_request_bill($1,$2,$3)",[restaurant,token,session])
 args[4]=JSON.stringify([{productId:"burger",quantity:1,selections:{drink:["cola"]}}])
 await assert.rejects(submit,/não aceita novos pedidos/)
 assert.equal((await db.query("select customer_comanda($1,$2) as result",[restaurant,token])).rows[0].result.billRequested,true)
 await db.exec("reset role")
 assert.equal((await db.query("select count(*)::integer as n from menu_bill_requests")).rows[0].n,1)
 await db.query("update menu_sessions set status='closed',closed_at=now()")
 await db.exec("set role anon")
 assert.equal((await db.query("select customer_comanda($1,$2) as result",[restaurant,token])).rows[0].result.orders.length,0)
 await assert.rejects(()=>db.query("select customer_request_bill($1,$2,$3)",[restaurant,token,session]),/fechada/)
 console.log("Passed: permissions, server pricing, retry deduplication, QR validation, product/restaurant blocks, choices, bill requests and closed sessions.")
} finally { await db.close() }

