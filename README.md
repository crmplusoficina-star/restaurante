# BRASA 47 — cardápio do cliente

Cardápio estático em React, TypeScript e Vite. O cliente consulta categorias, busca pratos, filtra opções disponíveis, guarda favoritos durante a visita e abre detalhes com preços e opções de acompanhamento. Interface de app com tema escuro, categorias horizontais, navegação inferior fixa e ficha de produto em painel no celular. Funciona em celular e desktop, com navegação por teclado e fechamento dos detalhes com Escape.

Não há gestão, edição, login, carrinho, pedidos, comanda, pagamentos ou conexão com banco de dados. O catálogo fica em `src/menu.ts`; preços são armazenados em centavos. As imagens são ilustrativas do Unsplash.

## Desenvolvimento

```sh
npm install
npm run dev
npm run build
```

A base de publicação existente é `/restaurante/`.

## O que falta para um cardápio definitivo

- Fotos reais de cada produto, incluindo combos e bebidas.
- Validar receitas, porções, disponibilidade e preços com o restaurante.
- Ingredientes e alergênicos confirmados pela equipe; o app orienta o cliente a consultar a equipe enquanto isso.
- Endereço, horários e contato reais, caso devam aparecer. Esses dados não foram inventados.

Os arquivos SQL em `supabase/`, o módulo `src/backend.ts` e os testes SQL antigos são referências históricas sem uso pelo cardápio atual. Nenhum banco precisa ser configurado ou criado.
