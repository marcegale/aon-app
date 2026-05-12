import { prisma } from "@/app/lib/prisma";
import { GoogleTokenSet } from "@/lib/recruiting/google/oauth";
import { refreshGoogleAccessToken } from "@/lib/recruiting/google/oauth";
import { decryptRecruitingToken } from "@/lib/recruiting/tokenCrypto";
import { encryptRecruitingToken } from "@/lib/recruiting/tokenCrypto";

function encrypted(value?: string | null) {
  return value ? encryptRecruitingToken(value) : null;
}

function expiryDate(value?: number | null) {
  return typeof value === "number" ? new Date(value) : null;
}

export async function upsertGoogleEmailAccount(input: {
  tenantId: string;
  userId: string;
  email: string;
  googleAccountId: string;
  tokens: GoogleTokenSet;
}) {
  const existing = await prisma.recruitingEmailAccount.findFirst({
    where: {
      tenantId: input.tenantId,
      userId: input.userId,
      provider: "google",
    },
  });

  const data = {
    email: input.email,
    googleAccountId: input.googleAccountId,
    accessToken: encrypted(input.tokens.access_token),
    refreshToken: input.tokens.refresh_token
      ? encrypted(input.tokens.refresh_token)
      : existing?.refreshToken ?? null,
    tokenType: input.tokens.token_type ?? null,
    scope: input.tokens.scope ?? null,
    expiryDate: expiryDate(input.tokens.expiry_date),
  };

  if (existing) {
    return prisma.recruitingEmailAccount.update({
      where: { id: existing.id },
      data,
    });
  }

  return prisma.recruitingEmailAccount.create({
    data: {
      tenantId: input.tenantId,
      userId: input.userId,
      provider: "google",
      ...data,
    },
  });
}

export async function getRecruitingEmailAccount(input: {
  tenantId: string;
  userId: string;
}) {
  return prisma.recruitingEmailAccount.findFirst({
    where: {
      tenantId: input.tenantId,
      userId: input.userId,
      provider: "google",
    },
    orderBy: { updatedAt: "desc" },
  });
}

export async function enableRecruitingEmailMonitoring(input: {
  tenantId: string;
  userId: string;
}) {
  const account = await getRecruitingEmailAccount(input);
  if (!account) throw new Error("Recruiting email account not connected");

  return prisma.recruitingEmailAccount.update({
    where: { id: account.id },
    data: { monitoringEnabled: true },
  });
}

export async function disableRecruitingEmailMonitoring(input: {
  tenantId: string;
  userId: string;
}) {
  const account = await getRecruitingEmailAccount(input);
  if (!account) throw new Error("Recruiting email account not connected");

  return prisma.recruitingEmailAccount.update({
    where: { id: account.id },
    data: { monitoringEnabled: false },
  });
}

export async function getAuthorizedRecruitingEmailAccount(input: {
  tenantId: string;
  userId: string;
}) {
  const account = await getRecruitingEmailAccount(input);
  if (!account) throw new Error("Recruiting email account not connected");

  const needsRefresh =
    !account.accessToken ||
    !account.expiryDate ||
    account.expiryDate.getTime() <= Date.now() + 5 * 60 * 1000;

  if (!needsRefresh) {
    if (!account.accessToken) {
      throw new Error("Recruiting email account is missing access token");
    }
    return {
      account,
      accessToken: decryptRecruitingToken(account.accessToken),
    };
  }

  if (!account.refreshToken) {
    throw new Error("Recruiting email account is missing refresh token");
  }

  const refreshed = await refreshGoogleAccessToken(decryptRecruitingToken(account.refreshToken));
  if (!refreshed.access_token) {
    throw new Error("Google did not return a refreshed access token");
  }

  const updated = await prisma.recruitingEmailAccount.update({
    where: { id: account.id },
    data: {
      accessToken: encryptRecruitingToken(refreshed.access_token),
      refreshToken: refreshed.refresh_token
        ? encryptRecruitingToken(refreshed.refresh_token)
        : account.refreshToken,
      tokenType: refreshed.token_type ?? account.tokenType,
      scope: refreshed.scope ?? account.scope,
      expiryDate: expiryDate(refreshed.expiry_date) ?? account.expiryDate,
    },
  });

  return {
    account: updated,
    accessToken: refreshed.access_token,
  };
}
