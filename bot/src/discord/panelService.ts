import fs from "node:fs";
import path from "node:path";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  Client,
  EmbedBuilder,
  Events,
  Message,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  TextChannel
} from "discord.js";

const stateFilePath = path.resolve(__dirname, "panel_state.json");

function readPanelMessageId(): string | null {
  if (!fs.existsSync(stateFilePath)) return null;
  const raw = JSON.parse(fs.readFileSync(stateFilePath, "utf-8")) as { messageId?: string };
  return raw.messageId ?? null;
}

function writePanelMessageId(messageId: string): void {
  fs.writeFileSync(stateFilePath, JSON.stringify({ messageId }, null, 2));
}

export async function ensureSinglePanelMessage(client: Client, channelId: string): Promise<string> {
  const channel = await client.channels.fetch(channelId);
  if (!channel || channel.type !== ChannelType.GuildText) {
    throw new Error("CHANNEL_ID must point to a text channel.");
  }

  const textChannel = channel as TextChannel;
  const existingId = readPanelMessageId();

  if (existingId) {
    try {
      const msg = await textChannel.messages.fetch(existingId);
      await msg.edit(buildPanelPayload());
      await removeDuplicates(textChannel, msg.id);
      return msg.id;
    } catch {
      // If message was deleted, recreate it below.
    }
  }

  const created = await textChannel.send(buildPanelPayload());
  writePanelMessageId(created.id);
  await removeDuplicates(textChannel, created.id);
  return created.id;
}

async function removeDuplicates(channel: TextChannel, keepId: string): Promise<void> {
  const recent = await channel.messages.fetch({ limit: 50 });
  const duplicates = recent.filter((msg) => msg.author.id === channel.client.user?.id && msg.id !== keepId);
  await Promise.all(duplicates.map((message) => message.delete().catch(() => undefined)));
}

export function registerPanelRecreationOnDelete(client: Client, channelId: string): void {
  client.on(Events.MessageDelete, async (message) => {
    const trackedId = readPanelMessageId();
    if (!trackedId || message.id !== trackedId || message.channelId !== channelId) return;
    await ensureSinglePanelMessage(client, channelId);
  });
}

function buildPanelPayload(): {
  embeds: EmbedBuilder[];
  components: [ActionRowBuilder<StringSelectMenuBuilder>, ActionRowBuilder<ButtonBuilder>];
} {
  const embed = new EmbedBuilder()
    .setTitle("Rust VIP Center")
    .setDescription("Selecione o servidor e use os botões para vincular Steam ou comprar VIP.")
    .setColor(0x00ae86);

  const select = new StringSelectMenuBuilder()
    .setCustomId("server_select")
    .setPlaceholder("Selecione um servidor Rust")
    .addOptions(
      new StringSelectMenuOptionBuilder().setLabel("Servidor 1").setValue("server1"),
      new StringSelectMenuOptionBuilder().setLabel("Servidor 2").setValue("server2")
    );

  const buttons = [
    new ButtonBuilder().setCustomId("link_steam").setLabel("Vincular Steam").setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId("buy_vip").setLabel("Comprar VIP").setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId("buy_vip_plus").setLabel("Comprar VIP+").setStyle(ButtonStyle.Success)
  ];

  return {
    embeds: [embed],
    components: [
      new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(select),
      new ActionRowBuilder<ButtonBuilder>().addComponents(buttons)
    ]
  };
}
