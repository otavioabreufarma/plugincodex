export type SupportedServerId = "server1" | "server2";

export interface VipRecord {
  discordId: string;
  steamId: string;
  vipType: "vip" | "vip+" | null;
  vipExpiresAt: string | null;
  serverId: SupportedServerId;
}

export interface PendingBotEvent {
  eventId: string;
  type: "PAYMENT_CONFIRMED" | "VIP_EXPIRED";
  discordId: string;
  serverId: SupportedServerId;
  vipType?: "vip" | "vip+";
  createdAt: string;
  processed: boolean;
}

export interface PaymentOrder {
  orderNsu: string;
  discordId: string;
  serverId: SupportedServerId;
  vipType: "vip" | "vip+";
  createdAt: string;
}
