// Students authenticate with their ID/passport number rather than email, since
// email addresses can change and must never invalidate payment history or access.
export function normalizeIdentificationNumber(value: string) {
  return value.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
}
