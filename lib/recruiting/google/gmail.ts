import { google } from "googleapis";
import { extractRecruitingRef } from "@/lib/recruiting/ref";

export type GmailClient = ReturnType<typeof createAuthenticatedGmailClient>;

export type GmailMessageSummary = {
  id: string;
  threadId?: string | null;
};

export type GmailAttachment = {
  attachmentId: string;
  fileName: string;
  mimeType: string;
  size?: number | null;
};

export type GmailMessageDetails = GmailMessageSummary & {
  historyId?: string | null;
  subject: string | null;
  from: string | null;
  date: Date | null;
  snippet: string | null;
  bodyText: string | null;
  refCode: string | null;
  attachments: GmailAttachment[];
};

type GmailPart = {
  filename?: string | null;
  mimeType?: string | null;
  body?: {
    attachmentId?: string | null;
    data?: string | null;
    size?: number | null;
  } | null;
  parts?: GmailPart[] | null;
};

function decodeBase64Url(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function getHeader(headers: Array<{ name?: string | null; value?: string | null }> | undefined, name: string) {
  return headers?.find((header) => header.name?.toLowerCase() === name.toLowerCase())?.value ?? null;
}

function collectBodyText(part?: GmailPart | null): string {
  if (!part) return "";
  const directText =
    part.body?.data && ["text/plain", "text/html"].includes(part.mimeType ?? "")
      ? decodeBase64Url(part.body.data)
      : "";
  const nested = (part.parts ?? []).map((child) => collectBodyText(child)).join("\n");
  return [directText, nested].filter(Boolean).join("\n");
}

function isPotentialCvAttachment(fileName?: string | null, mimeType?: string | null) {
  const name = fileName?.toLowerCase() ?? "";
  const type = mimeType?.toLowerCase() ?? "";
  return (
    name.endsWith(".pdf") ||
    name.endsWith(".doc") ||
    name.endsWith(".docx") ||
    type === "application/pdf" ||
    type === "application/msword" ||
    type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  );
}

function collectAttachments(parts?: GmailPart[] | null): GmailAttachment[] {
  if (!parts) return [];
  const attachments: GmailAttachment[] = [];

  for (const part of parts) {
    if (part.filename && part.body?.attachmentId && isPotentialCvAttachment(part.filename, part.mimeType)) {
      attachments.push({
        attachmentId: part.body.attachmentId,
        fileName: part.filename,
        mimeType: part.mimeType ?? "application/octet-stream",
        size: part.body.size ?? null,
      });
    }
    attachments.push(...collectAttachments(part.parts));
  }

  return attachments;
}

export function createAuthenticatedGmailClient(accessToken: string) {
  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI,
  );
  auth.setCredentials({ access_token: accessToken });
  return google.gmail({ version: "v1", auth });
}

export async function listRecentMessages(input: {
  gmail: GmailClient;
  query?: string;
  maxResults?: number;
}): Promise<GmailMessageSummary[]> {
  const result = await input.gmail.users.messages.list({
    userId: "me",
    q: input.query ?? "has:attachment newer_than:30d",
    maxResults: input.maxResults ?? 10,
  });

  return (result.data.messages ?? [])
    .filter((message): message is { id: string; threadId?: string | null } => Boolean(message.id))
    .map((message) => ({ id: message.id, threadId: message.threadId }));
}

export async function getMessage(input: {
  gmail: GmailClient;
  messageId: string;
}): Promise<GmailMessageDetails> {
  const result = await input.gmail.users.messages.get({
    userId: "me",
    id: input.messageId,
    format: "full",
  });

  const payload = result.data.payload as GmailPart & {
    headers?: Array<{ name?: string | null; value?: string | null }>;
  };
  const bodyText = collectBodyText(payload);
  const subject = getHeader(payload?.headers, "subject");
  const from = getHeader(payload?.headers, "from");
  const dateHeader = getHeader(payload?.headers, "date");
  const date =
    result.data.internalDate
      ? new Date(Number(result.data.internalDate))
      : dateHeader
        ? new Date(dateHeader)
        : null;

  return {
    id: input.messageId,
    threadId: result.data.threadId,
    historyId: result.data.historyId,
    subject,
    from,
    date: date && Number.isFinite(date.getTime()) ? date : null,
    snippet: result.data.snippet ?? null,
    bodyText,
    refCode: detectRefCodeFromSubjectOrBody({ subject, body: `${result.data.snippet ?? ""}\n${bodyText}` }),
    attachments: collectAttachments(payload?.parts),
  };
}

export async function downloadAttachment(input: {
  gmail: GmailClient;
  messageId: string;
  attachmentId: string;
}) {
  const result = await input.gmail.users.messages.attachments.get({
    userId: "me",
    messageId: input.messageId,
    id: input.attachmentId,
  });
  const data = result.data.data;
  if (!data) {
    throw new Error("Gmail attachment did not include data");
  }
  return Buffer.from(data, "base64url");
}

export function detectRefCodeFromSubjectOrBody(input: {
  subject?: string | null;
  body?: string | null;
}) {
  return extractRecruitingRef(input.subject, input.body);
}
