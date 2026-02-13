import { Client, Guild } from "discord.js";
import { env } from "../config/env";
import { ackBotEvent, fetchBotEvents } from "./backendApi";
import { grantOrRemoveRole } from "../discord/interactionHandler";

export function startEventPolling(client: Client): void {
  setInterval(async () => {
    if (!client.isReady()) return;

    try {
      const guild = (await client.guilds.fetch(env.guildId)) as Guild;
      const events = await fetchBotEvents();

      for (const event of events) {
        const member = await guild.members.fetch(event.discordId).catch(() => null);
        if (!member) {
          await ackBotEvent(event.eventId);
          continue;
        }

        if (event.type === "PAYMENT_CONFIRMED" && event.vipType) {
          await grantOrRemoveRole(member, event.vipType, env.vipRoleId, env.vipPlusRoleId, true);
          await member.send(`Pagamento confirmado! Seu ${event.vipType.toUpperCase()} foi ativado no ${event.serverId}.`);
        }

        if (event.type === "VIP_EXPIRED" && event.vipType) {
          await grantOrRemoveRole(member, event.vipType, env.vipRoleId, env.vipPlusRoleId, false);
          await member.send(`Seu ${event.vipType.toUpperCase()} expirou no ${event.serverId}.`);
        }

        await ackBotEvent(event.eventId);
      }
    } catch (error) {
      console.error("Polling error:", error);
    }
  }, env.pollingIntervalMs);
}
