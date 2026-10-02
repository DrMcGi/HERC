import { createHash } from "crypto";

// Server-only: Ozow request signing and notify verification.
// Field order below follows Ozow's published HashCheck specification.
// Verify against your Ozow merchant dashboard / current API docs before going live.

export const OZOW_PROGRAMME_AMOUNT = "12550.00";

function getConfig() {
  const siteCode = process.env.OZOW_SITE_CODE;
  const privateKey = process.env.OZOW_PRIVATE_KEY;
  const apiKey = process.env.OZOW_API_KEY;
  const isTest = process.env.OZOW_IS_TEST !== "false";
  if (!siteCode || !privateKey || !apiKey) {
    throw new Error("Ozow is not configured. Set OZOW_SITE_CODE, OZOW_PRIVATE_KEY and OZOW_API_KEY.");
  }
  return { siteCode, privateKey, apiKey, isTest };
}

function hashFields(values: (string | number | boolean)[], privateKey: string) {
  const concatenated = values.map((value) => String(value)).join("") + privateKey;
  return createHash("sha512").update(concatenated.toLowerCase()).digest("hex");
}

export type OzowPaymentRequest = {
  transactionReference: string;
  bankReference: string;
  amount: string;
  customer: string;
  cancelUrl: string;
  errorUrl: string;
  successUrl: string;
  notifyUrl: string;
};

export function buildPaymentRequestBody(request: OzowPaymentRequest) {
  const { siteCode, privateKey, isTest } = getConfig();
  const countryCode = "ZA";
  const currencyCode = "ZAR";
  const optional1 = "", optional2 = "", optional3 = "", optional4 = "", optional5 = "";

  // Ozow "Post Payment Request" HashCheck field order (see docs.ozow.com).
  const hashCheck = hashFields([
    siteCode, countryCode, currencyCode, request.amount, request.transactionReference,
    request.bankReference, optional1, optional2, optional3, optional4, optional5,
    request.customer, request.cancelUrl, request.errorUrl, request.successUrl, request.notifyUrl,
    isTest,
  ], privateKey);

  return {
    siteCode, countryCode, currencyCode, amount: request.amount,
    transactionReference: request.transactionReference, bankReference: request.bankReference,
    customer: request.customer, cancelUrl: request.cancelUrl, errorUrl: request.errorUrl,
    successUrl: request.successUrl, notifyUrl: request.notifyUrl, isTest, hashCheck,
  };
}

export async function requestOzowPaymentUrl(request: OzowPaymentRequest) {
  const { apiKey, isTest } = getConfig();
  const endpoint = isTest ? "https://stagingapi.ozow.com/postpaymentrequest" : "https://api.ozow.com/postpaymentrequest";
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json", ApiKey: apiKey },
    body: JSON.stringify(buildPaymentRequestBody(request)),
  });
  const data = await response.json();
  if (!response.ok || data.errorMessage) throw new Error(data.errorMessage || "Ozow declined the payment request.");
  return data.url as string;
}

export type OzowNotifyPayload = {
  SiteCode: string; TransactionId: string; TransactionReference: string; Amount: string; Status: string;
  Optional1?: string; Optional2?: string; Optional3?: string; Optional4?: string; Optional5?: string;
  CurrencyCode: string; IsTest: string; StatusMessage: string; RequestId: string; BankReference: string; Hash: string;
};

export function verifyNotifyHash(payload: OzowNotifyPayload) {
  const { privateKey } = getConfig();
  // Ozow notify HashCheck field order (see docs.ozow.com).
  const expected = hashFields([
    payload.SiteCode, payload.TransactionId, payload.TransactionReference, payload.Amount, payload.Status,
    payload.Optional1 || "", payload.Optional2 || "", payload.Optional3 || "", payload.Optional4 || "", payload.Optional5 || "",
    payload.CurrencyCode, payload.IsTest, payload.StatusMessage, payload.RequestId, payload.BankReference,
  ], privateKey);
  return expected === payload.Hash.toLowerCase();
}
