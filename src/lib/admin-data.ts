/**
 * Mock data layer for the TechPulse admin back-office.
 * Standalone simulation of subscribers, audit log and metrics.
 * Dependency-free and server-safe (plain constants + pure helpers).
 */

export type AdminRole = "ADMIN" | "USER";

export type SubscriberStatus = "ACTIVE_PREMIUM" | "FREE" | "EXPIRED";

export type AuditActionType = "AUTH" | "SUBSCRIPTION" | "CONTENT";

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  role: AdminRole;
  status: SubscriberStatus;
  joinedDate: string;
  lastActive: string;
  stripeCustomerId: string | null;
};

export type ActivityEntry = {
  id: string;
  user: string;
  action: string;
  target: string;
  timestamp: string;
  type: AuditActionType;
};

export type AdminMetrics = {
  totalUsers: number;
  activeSubscribers: number;
  monthlyRevenue: number;
  conversionRate: number;
};

export const ADMIN_USERS: AdminUser[] = [
  {
    id: "usr_01HQK7CAMILLE",
    name: "Camille Moreau",
    email: "camille.moreau@techpulse.dev",
    avatar: null,
    role: "ADMIN",
    status: "ACTIVE_PREMIUM",
    joinedDate: "2024-03-12T09:14:00Z",
    lastActive: "2026-09-19T08:42:00Z",
    stripeCustomerId: "cus_9H2K4M7Q1XAB12",
  },
  {
    id: "usr_01HQK7HUGOLEV",
    name: "Hugo Lefevre",
    email: "hugo.lefevre@example.fr",
    avatar: null,
    role: "USER",
    status: "ACTIVE_PREMIUM",
    joinedDate: "2024-06-28T15:03:00Z",
    lastActive: "2026-09-19T07:55:00Z",
    stripeCustomerId: "cus_4P8R2T6W3YCD34",
  },
  {
    id: "usr_01HQK7INESDIA",
    name: "Ines Diallo",
    email: "ines.diallo@example.fr",
    avatar: null,
    role: "USER",
    status: "FREE",
    joinedDate: "2025-01-17T11:26:00Z",
    lastActive: "2026-09-18T21:12:00Z",
    stripeCustomerId: null,
  },
  {
    id: "usr_01HQK7THEOMAR",
    name: "Theo Marchand",
    email: "theo.marchand@example.com",
    avatar: null,
    role: "USER",
    status: "EXPIRED",
    joinedDate: "2024-11-02T18:40:00Z",
    lastActive: "2026-09-15T10:04:00Z",
    stripeCustomerId: "cus_7N3V5B8M2ZEF56",
  },
  {
    id: "usr_01HQK7LEAFONT",
    name: "Lea Fontaine",
    email: "lea.fontaine@example.fr",
    avatar: null,
    role: "USER",
    status: "ACTIVE_PREMIUM",
    joinedDate: "2025-04-09T08:57:00Z",
    lastActive: "2026-09-19T06:31:00Z",
    stripeCustomerId: "cus_2Q6W9E4R7TGH78",
  },
  {
    id: "usr_01HQK7NATHGIR",
    name: "Nathan Girard",
    email: "nathan.girard@example.com",
    avatar: null,
    role: "USER",
    status: "FREE",
    joinedDate: "2026-02-21T14:19:00Z",
    lastActive: "2026-09-18T17:48:00Z",
    stripeCustomerId: null,
  },
  {
    id: "usr_01HQK7SARAHBE",
    name: "Sarah Benali",
    email: "sarah.benali@techpulse.dev",
    avatar: null,
    role: "ADMIN",
    status: "ACTIVE_PREMIUM",
    joinedDate: "2024-01-30T10:05:00Z",
    lastActive: "2026-09-19T08:15:00Z",
    stripeCustomerId: "cus_5JK8L1N4P6QRS90",
  },
  {
    id: "usr_01HQK7MAXROCH",
    name: "Maxime Roche",
    email: "maxime.roche@example.fr",
    avatar: null,
    role: "USER",
    status: "EXPIRED",
    joinedDate: "2025-09-14T19:33:00Z",
    lastActive: "2026-09-10T12:27:00Z",
    stripeCustomerId: "cus_8UV3X6Y9Z2ATU12",
  },
];

export const ACTIVITY_LOG: ActivityEntry[] = [
  {
    id: "evt_101",
    user: "Lea Fontaine",
    action: "A renouvele son abonnement Premium",
    target: "Formule mensuelle - 9,99 EUR",
    timestamp: "2026-09-19T08:36:00Z",
    type: "SUBSCRIPTION",
  },
  {
    id: "evt_102",
    user: "Sarah Benali",
    action: "A publie un article",
    target: "Observabilite LLM : tracer sans se ruiner",
    timestamp: "2026-09-19T08:15:00Z",
    type: "CONTENT",
  },
  {
    id: "evt_103",
    user: "Hugo Lefevre",
    action: "S'est connecte avec Google",
    target: "Session web - Paris",
    timestamp: "2026-09-19T07:55:00Z",
    type: "AUTH",
  },
  {
    id: "evt_104",
    user: "Camille Moreau",
    action: "A fait passer un lecteur en Premium",
    target: "lea.fontaine@example.fr",
    timestamp: "2026-09-19T07:20:00Z",
    type: "SUBSCRIPTION",
  },
  {
    id: "evt_105",
    user: "Ines Diallo",
    action: "A cree un compte gratuit",
    target: "Formule Free Reader",
    timestamp: "2026-09-18T21:12:00Z",
    type: "AUTH",
  },
  {
    id: "evt_106",
    user: "Nathan Girard",
    action: "A commente un article",
    target: "Terraform vs OpenTofu en 2026",
    timestamp: "2026-09-18T17:48:00Z",
    type: "CONTENT",
  },
  {
    id: "evt_107",
    user: "Theo Marchand",
    action: "A resilie son abonnement Premium",
    target: "Fin de periode - 15 oct. 2026",
    timestamp: "2026-09-15T10:04:00Z",
    type: "SUBSCRIPTION",
  },
  {
    id: "evt_108",
    user: "Camille Moreau",
    action: "A modifie le role d'un membre",
    target: "sarah.benali@techpulse.dev vers ADMIN",
    timestamp: "2026-09-14T16:52:00Z",
    type: "AUTH",
  },
  {
    id: "evt_109",
    user: "Maxime Roche",
    action: "Echec de paiement",
    target: "Carte expiree - relance envoyee",
    timestamp: "2026-09-10T12:27:00Z",
    type: "SUBSCRIPTION",
  },
  {
    id: "evt_110",
    user: "Sarah Benali",
    action: "A mis a jour une enquete",
    target: "Kubernetes : le cout cache des clusters",
    timestamp: "2026-09-09T09:41:00Z",
    type: "CONTENT",
  },
];

export const ADMIN_METRICS: AdminMetrics = {
  totalUsers: 12840,
  activeSubscribers: 3120,
  monthlyRevenue: 28450,
  conversionRate: 24.3,
};

export function statusLabel(status: SubscriberStatus): string {
  switch (status) {
    case "ACTIVE_PREMIUM":
      return "Premium actif";
    case "FREE":
      return "Gratuit";
    case "EXPIRED":
      return "Expire";
  }
}

export function roleLabel(role: AdminRole): string {
  return role === "ADMIN" ? "Admin" : "Lecteur";
}

export function auditTypeLabel(type: AuditActionType): string {
  switch (type) {
    case "AUTH":
      return "Authentification";
    case "SUBSCRIPTION":
      return "Abonnement";
    case "CONTENT":
      return "Contenu";
  }
}

export function formatAdminDate(iso: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

export function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.max(1, Math.round(diffMs / 60000));
  if (minutes < 60) return "il y a " + minutes + " min";
  const hours = Math.round(minutes / 60);
  if (hours < 24) return "il y a " + hours + " h";
  const days = Math.round(hours / 24);
  if (days <= 1) return "il y a 1 jour";
  return "il y a " + days + " jours";
}

export function initialsOfAdmin(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => (part[0] ?? "").toUpperCase())
    .join("");
}
