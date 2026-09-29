# Testes E2E (Maestro)

Fluxos de ponta a ponta dos caminhos críticos, em `.maestro/`.

## Pré-requisitos

```bash
# macOS
brew install maestro
```

- App instalado no simulador (iOS) ou emulador/dispositivo (Android).
- Para Android, o `appId` é `com.tmdbapp` (ver `android/app/build.gradle`).

## Rodar

```bash
# Todos os fluxos
maestro test .maestro

# Um fluxo específico
maestro test .maestro/welcome-to-catalog.yaml
```

## Fluxos cobertos

| Arquivo | Caminho |
| :-- | :-- |
| `welcome-to-catalog.yaml` | Landing → botão → catálogo com busca e menu |
| `search.yaml` | Busca com debounce exibindo "Resultados para" |
| `favorites.yaml` | Favoritar card → menu → tela de Favoritos |
| `language.yaml` | Menu → troca para pt-BR refletindo na UI |

## Seletores

Usamos `testID`s estáveis (independentes de texto/idioma):

| Elemento | testID |
| :-- | :-- |
| Botão do menu | `header-menu-button` |
| Item "Catálogo" | `menu-catalog` |
| Item "Favoritos" | `menu-favorites` |
| Opção de idioma | `language-option-es-PY` / `language-option-pt-BR` |
| Campo de busca | `search-input` |
| Card de filme | `movie-card-<id>` |
| Botão de favorito | `favorite-button` |

> Observação: o `appId` do iOS é o `PRODUCT_BUNDLE_IDENTIFIER` do Xcode. Se for
> diferente de `com.tmdbapp`, ajuste o cabeçalho dos YAMLs.
