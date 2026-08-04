// src/lib/fawry.ts
import crypto from "crypto";

const FAWRY_SECURE_KEY = process.env.FAWRY_SECURE_KEY!;

interface FawryCallbackPayload {
  requestId: string;
  fawryRefNumber: string;
  merchantRefNumber: string;
  customerMobile?: string;
  customerMail?: string;
  paymentAmount: number;
  orderAmount: number;
  fawryFees?: number;
  orderStatus: "NEW" | "PAID" | "CANCELLED" | "EXPIRED" | "REFUNDED" | "FAILED";
  paymentMethod: string;
  messageSignature: string;
  orderExpiryDate?: number;
}

// NOTE: confirm exact field order against your Fawry merchant docs
// once you have live credentials — this is the commonly documented
// pattern but Fawry has tweaked it across API versions.
export function verifyFawryCallbackSignature(payload: FawryCallbackPayload): boolean {
  const raw =
    payload.fawryRefNumber +
    payload.merchantRefNumber +
    payload.paymentAmount.toFixed(2) +
    payload.orderAmount.toFixed(2) +
    payload.orderStatus +
    payload.paymentMethod +
    FAWRY_SECURE_KEY;

  const expected = crypto.createHash("sha256").update(raw).digest("hex");
  return expected === payload.messageSignature;
}