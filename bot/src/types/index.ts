export type SupportedServerId = "server1" | "server2";

export interface BotEvent {
  eventId: string;
  type: "PAYMENT_CONFIRMED" | "VIP_EXPIRED";
  discordId: string;
  serverId: SupportedServerId;
  vipType?: "vip" | "vip+";
  createdAt: string;
  processed: boolean;
}
