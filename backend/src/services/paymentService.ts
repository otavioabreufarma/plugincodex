import axios from "axios";
import { env } from "../config/env";
import { PaymentOrder, SupportedServerId } from "../types";
import { readPaymentOrders, writePaymentOrders } from "../utils/fileDb";
import { applyVip } from "./vipService";

const checkoutApi = "https://api.infinitepay.io/invoices/public/checkout/links";

export function generateOrderNsu(serverId: SupportedServerId, discordId: string, vipType: "vip" | "vip+"): string {
  return `${serverId}-${discordId}-${vipType}-${Date.now()}`;
}

export async function createCheckoutLink(input: {
  discordId: string;
  serverId: SupportedServerId;
  vipType: "vip" | "vip+";
}): Promise<{ checkoutUrl: string; orderNsu: string }> {
  const orderNsu = generateOrderNsu(input.serverId, input.discordId, input.vipType);
  const amount = input.vipType === "vip" ? env.vipPrice : env.vipPlusPrice;

  const payload = {
    handle: env.infinitepayHandle,
    amount,
    order_nsu: orderNsu,
    items: [
      {
        description: input.vipType === "vip" ? "Rust VIP" : "Rust VIP+",
        quantity: 1,
        price: amount
      }
    ],
    redirect_url: env.redirectUrl,
    webhook_url: `${env.baseUrl}/payments/webhooks/infinitepay`
  };

  const response = await axios.post(checkoutApi, payload, {
    headers: { "Content-Type": "application/json" }
  });

  const checkoutUrl = response.data?.link ?? response.data?.checkout_url ?? response.data?.url;
  if (!checkoutUrl) throw new Error("InfinitePay did not return a checkout URL.");

  const orders = readPaymentOrders();
  const order: PaymentOrder = {
    orderNsu,
    discordId: input.discordId,
    serverId: input.serverId,
    vipType: input.vipType,
    createdAt: new Date().toISOString()
  };
  orders.push(order);
  writePaymentOrders(orders);

  return { checkoutUrl, orderNsu };
}

export function processApprovedPayment(orderNsu: string, transactionNsu: string): void {
  if (!transactionNsu) throw new Error("transaction_nsu is required.");

  const orders = readPaymentOrders();
  const order = orders.find((item) => item.orderNsu === orderNsu);
  if (!order) {
    throw new Error(`order_nsu not found: ${orderNsu}`);
  }

  applyVip(order.serverId, order.discordId, order.vipType);
}
