import { prisma } from "@/app/lib/prisma";

export type RecruitingRole =
  | "admin"
  | "recruiter"
  | "hiring_manager"
  | "interviewer"
  | "readonly";

export type RecruitingPermission =
  | "manage_searches"
  | "manage_candidates"
  | "manage_interviews"
  | "manage_offers"
  | "manage_automation"
  | "readonly";

const rolePermissions: Record<RecruitingRole, RecruitingPermission[]> = {
  admin: [
    "manage_searches",
    "manage_candidates",
    "manage_interviews",
    "manage_offers",
    "manage_automation",
    "readonly",
  ],
  recruiter: ["manage_searches", "manage_candidates", "manage_interviews", "manage_offers", "readonly"],
  hiring_manager: ["manage_candidates", "manage_interviews", "readonly"],
  interviewer: ["manage_interviews", "readonly"],
  readonly: ["readonly"],
};

function readPermissions(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is RecruitingPermission => typeof item === "string")
    : [];
}

async function ensureDevelopmentDemoRole(input: {
  tenantId: string;
  userId?: string | null;
}) {
  if (
    process.env.NODE_ENV !== "development" ||
    input.tenantId !== "demo-tenant" ||
    input.userId !== "demo-user"
  ) {
    return;
  }

  await prisma.recruitingRoleAssignment.upsert({
    where: {
      tenantId_userId_role: {
        tenantId: "demo-tenant",
        userId: "demo-user",
        role: "recruiter",
      },
    },
    create: {
      tenantId: "demo-tenant",
      userId: "demo-user",
      role: "recruiter",
      permissions: ["manage_searches", "manage_candidates", "manage_interviews", "manage_offers", "readonly"],
    },
    update: {},
  });
}

export async function hasRecruitingPermission(input: {
  tenantId: string;
  userId?: string | null;
  permission: RecruitingPermission;
}) {
  if (!input.userId) {
    return true;
  }

  await ensureDevelopmentDemoRole(input);

  const assignments = await prisma.recruitingRoleAssignment.findMany({
    where: { tenantId: input.tenantId, userId: input.userId },
  });

  if (assignments.length === 0) {
    return false;
  }

  return assignments.some((assignment) => {
    const role = assignment.role as RecruitingRole;
    const permissions = [
      ...(rolePermissions[role] ?? []),
      ...readPermissions(assignment.permissions),
    ];
    return permissions.includes(input.permission);
  });
}

export async function requireRecruitingRole(input: {
  tenantId: string;
  userId?: string | null;
  permission: RecruitingPermission;
}) {
  const allowed = await hasRecruitingPermission(input);
  if (!allowed) {
    throw new Error("Recruiting permission denied");
  }
}

export async function requireRecruitingAdmin(input: {
  tenantId: string;
  userId?: string | null;
}) {
  if (!input.userId) {
    return;
  }
  const assignment = await prisma.recruitingRoleAssignment.findFirst({
    where: { tenantId: input.tenantId, userId: input.userId, role: "admin" },
    select: { id: true },
  });
  if (!assignment) {
    throw new Error("Recruiting admin permission denied");
  }
}

export async function canManageSearch(input: { tenantId: string; userId?: string | null }) {
  return hasRecruitingPermission({ ...input, permission: "manage_searches" });
}

export async function canManageCandidate(input: { tenantId: string; userId?: string | null }) {
  return hasRecruitingPermission({ ...input, permission: "manage_candidates" });
}

export async function canManageOffer(input: { tenantId: string; userId?: string | null }) {
  return hasRecruitingPermission({ ...input, permission: "manage_offers" });
}
