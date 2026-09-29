# Segurança

Práticas aplicadas no MangoCine, no código e na documentação.

## 1. Credenciais fora do controle de versão

- `.env` está no `.gitignore`; apenas `.env.example` é versionado.
- A app lê `TMDB_API_KEY` (v3) **ou** `TMDB_BEARER_TOKEN` /
  `TMDB_API_READ_ACCESS_TOKEN` (v4) em tempo de build (`src/app/config/env.ts`).

## 2. Chave demo explícita e acotada

- Existe uma API key pública **read-only** do TMDB para permitir rodar o app sem
  configuração. Está isolada em `TMDB_DEMO_API_KEY` e qualquer valor no `.env`
  tem precedência.
- Em ambiente real, **nunca** reutilizar essa chave.

## 3. Chaves de cliente não são secretas

Qualquer chave embutida em um app móvel é extraível do bundle. A mitigação real
é intermediar chamadas por um **backend/proxy** próprio (ou tokens de curta
duração) — não ofuscar a chave.

## 4. Logging de erros só em desenvolvimento

O middleware `rtkQueryErrorLogger` só loga sob `__DEV__`, evitando vazar
payloads em produção.

## 5. Firma de release fora do repositório

O `signingConfig` de release do Android lê credenciais de propriedades Gradle
(`MYAPP_UPLOAD_*`). Sem elas, cai para a keystore de debug **apenas** para
execução local; nunca publicar com essa firma.

## 6. Sem segredos em logs ou no compartilhamento

A tela de detalhe compartilha apenas a URL pública do TMDB — nunca cabeçalhos
nem tokens. Nenhum dado sensível do usuário é coletado ou logado.

## Checklist

- [x] `.env` ignorado; `.env.example` presente.
- [x] Nenhum segredo hardcoded real (apenas a chave demo pública, isolada e documentada).
- [x] Logs de erro restritos a `__DEV__`.
- [x] Release não assinado com a keystore de debug em produção.
- [x] Sem PII coletada; permissões mínimas (apenas `INTERNET`).
