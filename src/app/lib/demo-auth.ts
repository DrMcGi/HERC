export const ADMIN_EMAIL = "giftk.rantho@gmail.com";
export const ADMIN_PASSWORD = "Rantho@0293002";
export const COHORTS_KEY = "herc-cohorts";
export const USERS_KEY = "herc-users";
export const REGISTRATIONS_KEY = "herc-registrations";
export const CONTENT_KEY = "herc-content";
export const CERTIFICATES_KEY = "herc-certificates";

export type Cohort = { id: string; label: string; training: string; assessment: string };
export type User = { id: string; name: string; firstName?: string; middleName?: string; surname?: string; email: string; password: string; role: "student" | "admin"; phone?: string; address?: string; dateOfBirth?: string; age?: number; identificationNumber?: string; identificationType?: "South African ID" | "Passport"; nationality?: string; ethnicity?: string; homeLanguage?: string; qualification?: string; experience?: string; tradeTest?: "Yes" | "No"; tradeTestDetails?: string; cohort?: string; status?: "pending" | "approved" | "rejected" };
export type Registration = User & { phone: string; qualification: string; invoice: string; costAware?: string; venueAware?: string; submittedAt: string; status: "pending" | "approved" | "rejected" };
export type Certificate = { studentId: string; fileName: string; fileType: string; dataUrl: string; uploadedAt: string };

export const defaultCohorts: Cohort[] = [
  { id: "oct-05", label: "5-9 October 2026", training: "5-9 October 2026", assessment: "12-13 October 2026" },
  { id: "oct-26", label: "26-30 October 2026", training: "26-30 October 2026", assessment: "2-3 November 2026" },
  { id: "nov-16", label: "16-20 November 2026", training: "16-20 November 2026", assessment: "23-24 November 2026" },
];

export const defaultContent = {
  programmeTitle: "PV GreenCard 2026",
  programmeDescription: "Five days of practical training and two days of assessment, accredited with SAPVIA.",
  welcomeMessage: "Your HERC learning space is ready. Keep your momentum and make every session count.",
};

export function readStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const value = window.localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function writeStorage<T>(key: string, value: T) {
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function getCohorts() { return readStorage(COHORTS_KEY, defaultCohorts); }
export function getUsers() { return readStorage<User[]>(USERS_KEY, []); }
export function getRegistrations() { return readStorage<Registration[]>(REGISTRATIONS_KEY, []); }
export function getContent() { return readStorage(CONTENT_KEY, defaultContent); }
export function getCertificates() { return readStorage<Certificate[]>(CERTIFICATES_KEY, []); }
