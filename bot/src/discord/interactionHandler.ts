import { Client, Events, GuildMember } from "discord.js";
import { requestCheckoutLink, requestSteamLink } from "../services/backendApi";
import { SupportedServerId } from "../types";

const selectedServerByUser = new Map<string, SupportedServerId>();

export function registerInteractionHandler(client: Client): void {
  client.on(Events.InteractionCreate, async (interaction) => {
    if (interaction.isStringSelectMenu() && interaction.customId === "server_select") {
      const server = interaction.values[0] as SupportedServerId;
      selectedServerByUser.set(interaction.user.id, server);
      await interaction.reply({ content: `Servidor selecionado: ${server}`, ephemeral: true });
      return;
    }

    if (!interaction.isButton()) return;

    const serverId = selectedServerByUser.get(interaction.user.id);
    if (!serverId) {
      await interaction.reply({ content: "Selecione um servidor primeiro no menu.", ephemeral: true });
      return;
    }

    try {
      if (interaction.customId === "link_steam") {
        const steamLink = await requestSteamLink(interaction.user.id, serverId);
        await interaction.user.send(`Vincule sua Steam neste link: ${steamLink}`);
        await interaction.reply({ content: "Enviei o link de vinculação no seu DM.", ephemeral: true });
        return;
      }

      if (interaction.customId === "buy_vip" || interaction.customId === "buy_vip_plus") {
        const vipType = interaction.customId === "buy_vip" ? "vip" : "vip+";
        const checkout = await requestCheckoutLink(interaction.user.id, serverId, vipType);
        await interaction.user.send(`Seu link de pagamento ${vipType.toUpperCase()}: ${checkout}`);
        await interaction.reply({ content: "Link de pagamento enviado no DM.", ephemeral: true });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Falha na solicitação.";
      await interaction.reply({ content: `Erro: ${message}`, ephemeral: true });
    }
  });
}

export async function grantOrRemoveRole(member: GuildMember, vipType: "vip" | "vip+", vipRoleId: string, vipPlusRoleId: string, add: boolean): Promise<void> {
  const targetRoleId = vipType === "vip" ? vipRoleId : vipPlusRoleId;
  if (add) {
    await member.roles.add(targetRoleId);
  } else {
    await member.roles.remove(targetRoleId);
  }
}
