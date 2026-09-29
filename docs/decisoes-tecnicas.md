# Decisões técnicas

Cada decisão documentada como **decisão → porquê → trade-off**.

## 1. Arquitetura feature-driven + shared core

- **Decisão:** organizar por domínio (`features/movies`, `features/search`,
  `features/onboarding`) com núcleo transversal (`shared/`) e bootstrap
  centralizado (`app/`).
- **Porquê:** isola domínios, expõe *public APIs* por módulo (`index.ts`) e
  permite times em paralelo com poucos conflitos de merge.
- **Trade-off:** mais arquivos e curva inicial maior. Compensa ao escalar.

## 2. Redux Toolkit + RTK Query

- **Decisão:** RTK Query para cache/dedupe de rede; slices de domínio
  (`favoritesSlice` normalizado `{ byId, allIds }`, `moviesSlice` de
  filtros/página, `settingsSlice` de idioma).
- **Porquê:** estados de rede prontos (`isLoading`/`isFetching`/`isError`),
  favoritos O(1), `createSelector` memoizado e prefetch em `onPressIn`.
- **Trade-off:** mais peso que Context+fetch e dependência de Redux.
- **Alternativas:** React Query / SWR (ótimos, mas sem store de domínio tipado);
  fetch manual (mais código, sem cache).

## 3. React Navigation (Native Stack)

- **Decisão:** `@react-navigation/native-stack` com params tipados.
- **Porquê:** transições nativas, melhor performance e gestos nativos.
- **Trade-off:** menos personalizável que o stack JS.

## 4. Performance de listas (`FlatList`)

- **Decisão:** grade de 2 colunas com `removeClippedSubviews` (só Android),
  `maxToRenderPerBatch`, `windowSize`, `updateCellsBatchingPeriod` e `React.memo`.
- **Porquê:** sustentar ~60fps em scroll longo e paginação.
- **Trade-off:** `removeClippedSubviews` dá bugs no iOS, por isso é por
  plataforma. Alternativa futura: `@shopify/flash-list`.

## 5. Imagens

- **Decisão:** `w342` na grade, `w500` no pôster, `original` no backdrop;
  fallbacks visuais; `Skeleton` pulsante com native driver.
- **Porquê:** equilíbrio nitidez/banda e sem flashes.
- **Trade-off:** decodificação pode competir com a UI em listas gigantes — ver
  `adr/0001-modulo-nativo-imagens.md`.

## 6. Busca com debounce

- **Decisão:** `useDebounce` de 400ms e mínimo de 2 caracteres.
- **Porquê:** evita saturar `search/movie` a cada tecla e reduz re-renders.
- **Trade-off:** latência de ~400ms, sinalizada por um loader na barra.

## 7. i18n sem dependência externa

- **Decisão:** dicionários tipados + hook `useTranslation` sobre o Redux
  (`settingsSlice`), com invalidação do cache ao trocar de idioma.
- **Porquê:** zero dependência, tipo garante que `pt-BR` cobre todas as chaves do
  `es-PY`, e o idioma vira fonte única para UI, datas e `language` do TMDB.
- **Trade-off:** recursos avançados (pluralização ICU) ficam de fora; para o
  escopo atual não são necessários.
