export type AccessKind = "API" | "Azure";

export type AccessRequestStatus = "Pending" | "Approved" | "Rejected";

export type AccessRequest = {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  serviceName: string;
  kind: AccessKind;
  projectName: string;
  intendedUse: string;
  status: AccessRequestStatus;
  requestedAt: string;
  reviewedAt?: string;
  rejectionReason?: string;
};

export type QuotaUnit = "calls" | "tokens" | "images" | "minutes" | "GB" | "credits";

export type AccessAllocation = {
  id: string;
  requestId: string;
  studentId: string;
  studentEmail: string;
  serviceName: string;
  kind: AccessKind;
  quota: number;
  used: number;
  unit: QuotaUnit;
  startsAt: string;
  expiresAt: string;
  status: "Active" | "Exhausted" | "Expired" | "Suspended";
  warningLevelsSent: number[];
};

export type StudentNotification = {
  id: string;
  studentEmail: string;
  title: string;
  message: string;
  createdAt: string;
  unread: boolean;
  type: "request" | "approval" | "warning" | "exhausted" | "system";
};

export type NewAccessRequest = Pick<AccessRequest, "serviceName" | "kind" | "projectName" | "intendedUse">;

export function suggestedQuota(serviceName: string, kind: AccessKind): { quota: number; unit: QuotaUnit } {
  const normalized = serviceName.toLowerCase();
  if (normalized.includes("image")) return { quota: 50, unit: "images" };
  if (normalized.includes("video") || normalized.includes("speech") || normalized.includes("voice")) return { quota: 120, unit: "minutes" };
  if (normalized.includes("storage") || normalized.includes("database")) return { quota: 5, unit: "GB" };
  if (normalized.includes("gpt") || normalized.includes("openai") || normalized.includes("sarvam")) return { quota: 500_000, unit: "tokens" };
  if (kind === "Azure") return { quota: 1_000, unit: "credits" };
  return { quota: 10_000, unit: "calls" };
}

export function formatQuota(value: number, unit: QuotaUnit) {
  return `${new Intl.NumberFormat("en-IN").format(value)} ${unit}`;
}
