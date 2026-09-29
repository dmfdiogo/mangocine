# ADR 0001 — Módulo nativo para imagens do TMDB e scroll infinito

- **Status:** Aceito. Decisão: **não** criar TurboModule; adotar cache de imagem
  (`@d11/react-native-fast-image`) + virtualização.
- **Data:** 2026

## Adendo de implementação

Em vez de módulo nativo, foi implementado:

- `AppImage` (wrapper de `@d11/react-native-fast-image`) com cache de memória +
  disco (`cacheControl.immutable`), `priority` e `Skeleton`/fallback embutidos.
- `preloadImages` para pré-aquecer a cache dos pôsteres das próximas páginas.
- `getItemLayout` exato no catálogo (card de altura fixa + header sticky fora da
  lista), eliminando medição por célula.
- Prefetch sequencial de 5 páginas no primeiro load + `onEndReached` antecipado.

Meta: scroll fluido sem flashes nem picos de decode, sem código nativo próprio.

## Contexto

O catálogo pode exibir listas muito longas (paginadas, virtualizadas pelo
`FlatList`) com pôsteres do TMDB. O app precisa aguentar grandes volumes de
dados sem travar a UI nem estourar memória.

Pergunta levantada: **devemos criar um módulo nativo (TurboModule) para buscar
imagens, evitando bloquear a thread JS e garantindo um scroll infinito fluido?**

## O que já acontece hoje no React Native

- O componente `Image` do RN **já faz download e decodificação em threads
  nativas** (Android: Fresco; iOS: SDWebImage-like via `RCTImageLoader`). A
  thread JS não decodifica bitmap.
- O que realmente compete com a UI e a thread JS em listas longas é:
  1. **Volume de JS reexecutado** (render/commit/layout) ao montar e reciclar células.
  2. **Memória de bitmaps** mantidos em cache (a causa mais provável de OOM).
  3. **Frequência de imagens em resolução alta** sendo carregadas ao mesmo tempo.

Ou seja: o gargalo não é "buscar a imagem na thread JS" — é **quantas imagens,
em que resolução, ficam na memória** e **quantas células o JS processa por lote**.

## Alternativas avaliadas

| Opção                                                                                                           | Vantagem                                                                     | Custo / risco                                                                              |
| :-------------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------- |
| **A. `Image` nativo + tuning do `FlatList`** (atual)                                                            | Zero dependência nativa; decodificação já é nativa                           | Requer disciplina de tamanho de imagem e virtualização                                     |
| **B. Biblioteca de imagem com cache e prioridade** (`@d11/react-native-fast-image` / `react-native-fast-image`) | Cache de disco agressivo, `priority`, `preload`, `clearMemoryCache`          | Dependência nativa + pod install; manutenção da lib                                        |
| **C. TurboModule próprio**                                                                                      | Controle total de fila/cache/prioridade                                      | Alto custo (Kotlin+Swift), manutenção pesada, duplicaria o que o RN já faz; ganho marginal |
| **D. Backend próprio como proxy/CDN**                                                                           | Pode servir imagens no tamanho/cache corretos e reduzir exposição da API key | Requer infraestrutura; fora do escopo do app                                               |

## Decisão

**Não criar um módulo nativo agora (opção C).** O ganho não justifica o custo e a
complexidade de manutenção, porque o RN já decodifica imagens fora da thread JS.
Priorizamos:

1. **Tamanho correto por contexto:** `w342` na grade, `w500` no pôster de
   detalhe, `original` só no backdrop em tela cheia (já aplicado).
2. **Virtualização agressiva:** `windowSize`, `maxToRenderPerBatch`,
   `initialNumToRender`, `removeClippedSubviews` só no Android (já aplicado).
3. **Placeholders `Skeleton`** para evitar flashes e manter 60fps (já aplicado).

## Gatilhos para reavaliar (quando B ou C passam a valer a pena)

- FPS de scroll caindo de forma consistente abaixo de ~55fps **em dispositivo
  de entrada** com listas > 300 itens.
- OOM/`OutOfMemoryError` em Android de baixa memória durante scroll longo.
- Necessidade de `preload`/`priority`/cache offline de imagens.

Se algum gatilho ocorrer, a **próxima parada recomendada é a opção B**
(biblioteca com cache de disco), não o TurboModule próprio.

## Consequências

- Mantemos o app sem dependências nativas extra (build mais simples).
- Precisamos medir (ver `docs/performance.md`) antes de trocar de estratégia.
