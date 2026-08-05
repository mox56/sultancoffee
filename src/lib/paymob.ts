// src/lib/paymob.ts
import crypto from "crypto";

const PAYMOB_BASE_URL = "https://accept.paymob.com/api";

interface OrderItem {
  name: string;
  amount_cents: number;
  quantity: number;
}

interface BillingData {
  first_name: string;
  last_name: string;
  phone_number: string;
  email: string;
  city: string;
  street: string;
  building: string;
  floor: string;
  apartment: string;
  country: string;
}

// Step 1: exchange API key for a short-lived auth token
export async function getAuthToken(): Promise<string> {
  const res = await fetch(`${PAYMOB_BASE_URL}/auth/tokens`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ api_key: process.env.PAYMOB_API_KEY }),
  });
  if (!res.ok) {
    const errBody = await res.text();
    console.error("Paymob auth failed:", res.status, errBody);
    throw new Error(`Paymob auth failed: ${errBody}`);
  }
  const data = await res.json();
  return data.token;
}

// Step 2: register an order with Paymob
export async function createPaymobOrder(
  authToken: string,
  amountCents: number,
  merchantOrderId: string,
  items: OrderItem[]
): Promise<number> {
  const res = await fetch(`${PAYMOB_BASE_URL}/ecommerce/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      auth_token: authToken,
      delivery_needed: false,
      amount_cents: amountCents,
      currency: "EGP",
      merchant_order_id: merchantOrderId,
      items,
    }),
  });
  if (!res.ok) {
    const errBody = await res.text();
    console.error("Paymob order creation failed:", res.status, errBody);
    throw new Error(`Paymob order creation failed: ${errBody}`);
  }
  const data = await res.json();
  return data.id;
}

// Step 3: get the payment key used to open the iframe
export async function getPaymentKey(
  authToken: string,
  amountCents: number,
  paymobOrderId: number,
  billingData: BillingData
): Promise<string> {
  const res = await fetch(`${PAYMOB_BASE_URL}/acceptance/payment_keys`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      auth_token: authToken,
      amount_cents: amountCents,
      expiration: 3600,
      order_id: paymobOrderId,
      billing_data: billingData,
      currency: "EGP",
      integration_id: Number(process.env.PAYMOB_INTEGRATION_ID),
    }),
  });
  if (!res.ok) {
    const errBody = await res.text();
    console.error("Paymob payment key request failed:", res.status, errBody);
    throw new Error(`Paymob payment key request failed: ${errBody}`);
  }
  const data = await res.json();
  return data.token;
}

export function buildIframeUrl(paymentKey: string): string {
  return `https://accept.paymob.com/api/acceptance/iframes/${process.env.PAYMOB_IFRAME_ID}?payment_token=${paymentKey}`;
}

// Verifies the webhook came from Paymob â€” HMAC-SHA512 over a specific
// concatenation of transaction fields, per Paymob's documented order.
// Field order matters and must match Paymob's docs exactly.
export function verifyPaymobHmac(obj: any, receivedHmac: string): boolean {
  const orderedFields = [
    "amount_cents",
    "created_at",
    "currency",
    "error_occured",
    "has_parent_transaction",
    "id",
    "integration_id",
    "is_3d_secure",
    "is_auth",
    "is_capture",
    "is_refunded",
    "is_standalone_payment",
    "is_voided",
    "order.id",
    "owner",
    "pending",
    "source_data.pan",
    "source_data.sub_type",
    "source_data.type",
    "success",
  ];

  const getNested = (path: string) =>
    path.split(".").reduce((acc, key) => acc?.[key], obj);

  const concatenated = orderedFields.map((field) => String(getNested(field))).join("");

  const computed = crypto
    .createHmac("sha512", process.env.PAYMOB_HMAC_SECRET!)
    .update(concatenated)
    .digest("hex");

  return computed === receivedHmac;
}
