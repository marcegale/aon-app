import { google } from "googleapis";
import { prisma } from "@/app/lib/prisma";
import { decryptRecruitingToken, encryptRecruitingToken } from "@/lib/recruiting/tokenCrypto";

const CALENDAR_SCOPES = [
  "https://www.googleapis.com/auth/calendar.events",
  "https://www.googleapis.com/auth/userinfo.email",
];

export function getCalendarRedirectUri(requestUrl?: string) {
  if (process.env.GOOGLE_CALENDAR_REDIRECT_URI) {
    return process.env.GOOGLE_CALENDAR_REDIRECT_URI;
  }

  if (!requestUrl) {
    throw new Error("GOOGLE_CALENDAR_REDIRECT_URI is required");
  }

  return new URL("/api/recruiting/calendar/callback", requestUrl).toString();
}

export function createGoogleCalendarOAuthClient(requestUrl?: string) {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CALENDAR_CLIENT_ID ?? process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CALENDAR_CLIENT_SECRET ?? process.env.GOOGLE_CLIENT_SECRET,
    getCalendarRedirectUri(requestUrl),
  );
}

export function createCalendarAuthUrl(input: {
  requestUrl: string;
  state: string;
  loginHint?: string | null;
}) {
  const client = createGoogleCalendarOAuthClient(input.requestUrl);
  return client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    include_granted_scopes: true,
    scope: CALENDAR_SCOPES,
    state: input.state,
    login_hint: input.loginHint ?? undefined,
  });
}

async function getCalendarClient(input: { tenantId: string; userId?: string | null }) {
  const connection = await prisma.recruitingCalendarConnection.findFirst({
    where: {
      tenantId: input.tenantId,
      provider: "google",
      isActive: true,
      ...(input.userId ? { userId: input.userId } : {}),
    },
    orderBy: { createdAt: "desc" },
  });

  if (!connection) {
    throw new Error("Google Calendar is not connected for this tenant");
  }

  const auth = createGoogleCalendarOAuthClient();
  auth.setCredentials({
    access_token: connection.encryptedAccessToken
      ? decryptRecruitingToken(connection.encryptedAccessToken)
      : undefined,
    refresh_token: decryptRecruitingToken(connection.encryptedRefreshToken),
    expiry_date: connection.tokenExpiresAt?.getTime(),
  });

  return google.calendar({ version: "v3", auth });
}

export async function refreshCalendarConnectionIfNeeded(input: { connectionId: string }) {
  const connection = await prisma.recruitingCalendarConnection.findUnique({ where: { id: input.connectionId } });
  if (!connection) throw new Error("Calendar connection not found");
  if (connection.tokenExpiresAt && connection.tokenExpiresAt.getTime() > Date.now() + 60_000) return connection;
  const auth = createGoogleCalendarOAuthClient();
  auth.setCredentials({ refresh_token: decryptRecruitingToken(connection.encryptedRefreshToken) });
  const { credentials } = await auth.refreshAccessToken();
  return prisma.recruitingCalendarConnection.update({
    where: { id: connection.id },
    data: {
      encryptedAccessToken: credentials.access_token ? encryptRecruitingToken(credentials.access_token) : connection.encryptedAccessToken,
      tokenExpiresAt: credentials.expiry_date ? new Date(credentials.expiry_date) : connection.tokenExpiresAt,
      isActive: true,
    },
  });
}

export async function markCalendarConnectionInvalid(input: { connectionId: string; reason?: string }) {
  return prisma.recruitingCalendarConnection.update({
    where: { id: input.connectionId },
    data: { isActive: false },
  });
}

export async function validateCalendarConnection(input: { tenantId: string; userId?: string | null }) {
  const connection = await prisma.recruitingCalendarConnection.findFirst({
    where: { tenantId: input.tenantId, provider: "google", isActive: true, ...(input.userId ? { userId: input.userId } : {}) },
    orderBy: { createdAt: "desc" },
  });
  if (!connection) return { ok: false, provider: "google", reason: "not_connected" };
  try {
    await refreshCalendarConnectionIfNeeded({ connectionId: connection.id });
    const calendar = await getCalendarClient(input);
    const result = await calendar.calendarList.list({ maxResults: 1 });
    return { ok: true, provider: "google", email: connection.email, calendars: result.data.items?.length ?? 0 };
  } catch (error) {
    await markCalendarConnectionInvalid({ connectionId: connection.id });
    return { ok: false, provider: "google", reason: error instanceof Error ? error.message : "unknown_error" };
  }
}

export function generateInterviewSchedulingLink(input: {
  sessionId: string;
  publicToken?: string | null;
}) {
  return input.publicToken ? `/interview/${input.publicToken}` : `/interview/session/${input.sessionId}`;
}

export async function createInterviewCalendarEvent(input: {
  tenantId: string;
  userId?: string | null;
  candidateName?: string | null;
  candidateEmail?: string | null;
  interviewerEmail?: string | null;
  scheduledAt: Date;
  timezone: string;
  title: string;
  description?: string | null;
}) {
  const calendar = await getCalendarClient(input);
  const end = new Date(input.scheduledAt.getTime() + 45 * 60 * 1000);
  const attendees = [input.candidateEmail, input.interviewerEmail]
    .filter((email): email is string => Boolean(email))
    .map((email) => ({ email }));

  const result = await calendar.events.insert({
    calendarId: "primary",
    conferenceDataVersion: 1,
    requestBody: {
      summary: input.title,
      description: input.description ?? undefined,
      start: { dateTime: input.scheduledAt.toISOString(), timeZone: input.timezone },
      end: { dateTime: end.toISOString(), timeZone: input.timezone },
      attendees,
      conferenceData: {
        createRequest: {
          requestId: `recruiting-${Date.now()}`,
          conferenceSolutionKey: { type: "hangoutsMeet" },
        },
      },
    },
  });

  console.info("calendar.event.created", {
    eventId: result.data.id,
    meetingUrl: result.data.hangoutLink,
  });

  return {
    eventId: result.data.id ?? null,
    meetingUrl: result.data.hangoutLink ?? null,
  };
}

export async function updateInterviewCalendarEvent(input: {
  tenantId: string;
  userId?: string | null;
  calendarEventId: string;
  scheduledAt: Date;
  timezone: string;
}) {
  const calendar = await getCalendarClient(input);
  const end = new Date(input.scheduledAt.getTime() + 45 * 60 * 1000);
  const result = await calendar.events.patch({
    calendarId: "primary",
    eventId: input.calendarEventId,
    requestBody: {
      start: { dateTime: input.scheduledAt.toISOString(), timeZone: input.timezone },
      end: { dateTime: end.toISOString(), timeZone: input.timezone },
    },
  });
  return { eventId: result.data.id ?? input.calendarEventId };
}

export async function cancelInterviewCalendarEvent(input: {
  tenantId: string;
  userId?: string | null;
  calendarEventId: string;
}) {
  const calendar = await getCalendarClient(input);
  await calendar.events.delete({
    calendarId: "primary",
    eventId: input.calendarEventId,
  });
  return { cancelled: true };
}
