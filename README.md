# BRASA 47 — cardápio do cliente

App do cliente em React, TypeScript e Vite. Tema escuro, categorias, busca, favoritos, adicionar produtos, pedido, comanda e pedir conta. Não há gestão, edição, login ou conexão com banco real.

## Fluxo local

- Adicionar abre a ficha do produto, com quantidade, opções e observação.
- Meu pedido permite ajustar quantidades e remover itens antes de confirmar.
- Confirmar pedido salva os itens na comanda deste navegador.
- Minha comanda mostra os pedidos confirmados e o total acumulado.
- Pedir conta exige confirmação e bloqueia novos pedidos.
- A comanda persiste em localStorage e utiliza a mesma chave da versão original, preservando comandas anteriores.
- O parâmetro `?mesa=5` separa as comandas locais; sem parâmetro, a mesa é 1.
- Os pedidos aparecem no app de operação em outra aba deste navegador. Não há sincronização entre celulares. A interface identifica o modo de demonstração local.
- Se o armazenamento falhar, o pedido é preservado e um erro é mostrado.

O catálogo estático fica em `src/menu.ts`; preços são armazenados em centavos. Fotos ilustrativas. Os favoritos e o pedido ainda não confirmado ficam na memória durante a visita.

## Desenvolvimento

```sh
npm install
npm run dev
npm run build
```

A base é `/restaurante/`. Alterações concluídas devem ser publicadas no GitHub Pages; o workflow publica a branch main.

## Conteúdo pendente

Fotos reais; validação de receitas, porções, preços e disponibilidade; ingredientes e alergênicos confirmados; endereço, horários e contato reais se necessários. Nenhum desses dados foi inventado.

Arquivos de backend e SQL são referências históricas sem uso pelo app. Nenhum banco precisa ser configurado ou criado.

## App de operação

Acesse `?app=operacao` para a operação, isolada da interface do cliente:

- `?app=operacao&perfil=atendimento`: mesas, abertura de comanda, pedidos com opções e observações, confirmação de entrega.
- `?app=operacao&perfil=cozinha`: fila por etapas Novo → Em preparo → Pronto, com tempo e observações.
- `?app=operacao&perfil=caixa`: comandas, contas solicitadas, registro local de Pix/cartão/dinheiro e encerramento.

Pedidos do cliente e da equipe compartilham o armazenamento na mesma origem e no mesmo navegador. Alterações circulam entre abas. A operação usa o mesmo formato das comandas antigas, incluindo a chave de armazenamento. A mesa só pode ser encerrada depois de todos os pedidos serem entregues; reabrir cria outra sessão e preserva o histórico de recebimentos. Registrar pagamento não processa Pix nem cartão.

Há 12 mesas iniciais de demonstração; outras mesas presentes no armazenamento também aparecem. A alternância de módulos é apenas navegação de protótipo, sem autenticação ou isolamento de permissões. Não usar para recebimentos reais. Para aparelhos diferentes, a próxima etapa é Supabase compartilhado com login e autorização por restaurante e função no servidor.

A assinatura e a gestão do catálogo não fazem parte deste app de operação.

### Teste dos fluxos

```sh
npm install
npx playwright install chromium
npm run dev -- --port 5174
npm run test:operation
```

O teste usa Chromium do sistema quando disponível. É possível definir `CHROMIUM_PATH`, `MENU_URL` e `SCREENSHOT_DIR`. Cria dados apenas em um contexto descartável do navegador e verifica o ciclo cliente → cozinha → atendimento → caixa → reabertura, opções, valores, histórico e sincronização entre abas.
