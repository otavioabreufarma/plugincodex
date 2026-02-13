# Rust VIP Platform (Backend + Bot + Plugin)

Projeto completo com 3 partes independentes:

- `backend/`: API Node.js + TypeScript + Express para Steam OpenID, InfinitePay, webhook, fila de eventos e endpoints para plugin.
- `bot/`: Bot Discord (discord.js v14) sem servidor HTTP, com painel único, DM de links e polling de eventos.
- `plugin/`: Plugin Oxide/uMod em C# para integração com backend por HTTP.

## Fluxo completo

1. Usuário interage com o painel no Discord.
2. Bot solicita ao backend link Steam ou checkout InfinitePay.
3. Backend processa callback Steam e webhook InfinitePay.
4. Backend enfileira eventos em JSON para o bot.
5. Bot faz polling, aplica/remove cargos e confirma ACK.
6. Plugin Rust consulta/aplica/remove VIP via endpoints protegidos.

## Deploy Discloud

Cada app (`backend` e `bot`) inclui:

- `discloud.config`
- `.discloudignore`

Pronto para deploy separado na Discloud.
