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
- Não há envio à cozinha, comunicação com atendente ou sincronização entre celulares. A interface identifica o modo de demonstração local.
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
