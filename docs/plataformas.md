# Paridade iOS x Android

Diferenças arquiteturais tratadas para manter o app consistente nas duas
plataformas.

## 1. Viewport, status bar e barras do sistema

| Item | iOS | Android |
| :-- | :-- | :-- |
| Safe area | `useSafeAreaInsets` (notch/Dynamic Island/home indicator) | `useSafeAreaInsets` (status bar/gesture nav) |
| Status bar | `UIStatusBarStyle = LightContent` no `Info.plist` + `<StatusBar barStyle="light-content" />` | theme com `statusBarColor`/`navigationBarColor` transparentes e `windowLightStatusBar=false` |
| Edge-to-edge | conteúdo atrás da status bar apenas onde é desejado (backdrop do detalhe) | idem, com `windowDrawsSystemBarBackgrounds` |
| Conteúdo inferior | `paddingBottom + insets.bottom` na lista e no detalhe | idem |

## 2. Comportamentos específicos

- **Botão físico de voltar (Android):** tratado nativamente pelo React
  Navigation (`goBack`), inclusive no detalhe.
- **Compartilhar:** `Share.share` usa o share sheet nativo em ambas.
- **Sombras:** usamos `shadow*` (iOS) **e** `elevation` (Android) juntos.
- **`removeClippedSubviews`:** habilitado só no Android (bugs de células em
  branco no iOS).
- **Teclado:** `windowSoftInputMode="adjustResize"` no Android e
  `keyboardShouldPersistTaps="handled"` na lista.
- **Tipografia:** fontes do sistema (San Francisco vs Roboto); os tokens de
  `typography` evitam alturas de linha que quebrem em um dos lados.

## 3. Checklist de validação manual

- [ ] Welcome → catálogo → detalhe em ambos os SOs.
- [ ] Status bar legível sobre o fundo escuro.
- [ ] Nada cortado atrás da status bar nem da barra de gestos/navegação.
- [ ] Scroll infinito sem células em branco (iOS) nem excessive memory (Android).
- [ ] Compartilhar abre o sheet nativo.
- [ ] Troca de idioma no menu reflete na hora e recarrega o conteúdo.
- [ ] Rotação de tela (Android) sem quebrar o grid.
