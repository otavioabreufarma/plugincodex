import { Client, GatewayIntentBits } from "discord.js";
import { env } from "./config/env";
import { ensureSinglePanelMessage, registerPanelRecreationOnDelete } from "./discord/panelService";
import { registerInteractionHandler } from "./discord/interactionHandler";
import { startEventPolling } from "./services/eventPolling";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.once("ready", async () => {
  console.log(`Bot logged in as ${client.user?.tag}`);
  await ensureSinglePanelMessage(client, env.channelId);
  registerPanelRecreationOnDelete(client, env.channelId);
  startEventPolling(client);
});

registerInteractionHandler(client);

client.login(env.token);
