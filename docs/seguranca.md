# Segurança

Práticas aplicadas no MangoCine, no código e na documentação.

## 1. Nenhum segredo real versionado

- O app embute apenas uma **API key pública read-only** do TMDB
  (`src/app/config/env.ts`) para rodar sem configuração. TMDB v3 keys são
  identificadores _somente-leitura_: podem ser rotacionadas e não alteram dados.
- Para publicar sua própria build, basta trocar o valor por uma chave sua.
- Nenhum token privado, credencial de usuário ou dado pessoal é versionado.

## 2. Chaves de cliente não são secretas

Qualquer chave embutida em um app móvel é extraível do bundle. A mitigação real
é intermediar chamadas por um **backend/proxy** próprio (ou tokens de curta
duração) — não ofuscar a chave.

## 3. Logging de erros só em desenvolvimento

O logger estruturado só anexa o transporte de console em `__DEV__`; em produção
não há saída a menos que um crash reporter seja configurado explicitamente.

## 4. Firma de release fora do repositório

O `signingConfig` de release do Android lê credenciais de propriedades Gradle
(`MYAPP_UPLOAD_*`). Sem elas, cai para a keystore de debug **apenas** para
execução local; nunca publicar com essa firma.

## 5. Sem segredos em logs ou no compartilhamento

A tela de detalhe compartilha apenas a URL pública do TMDB — nunca cabeçalhos
nem tokens. Nenhum dado sensível do usuário é coletado ou logado.

## Checklist

- [x] Nenhum segredo real versionado (apenas a chave demo pública, documentada).
- [x] Logs de erro restritos a `__DEV__`.
- [x] Release não assinado com a keystore de debug em produção.
- [x] Sem PII coletada; permissões mínimas (apenas `INTERNET`).
