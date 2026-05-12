import { google } from "googleapis";

type GmailClientInput = {
  refreshToken: string;
};

export type GmailAttachment = {
  attachmentId: string;
  fileName: string;
  mimeType: string;
};

export type GmailMessage = {
  id: string;
  threadId: string | null | undefined;
  historyId: string | null | undefined;
  subject: string | null;
  from: string | null;
  snippet: string | null;
  internalDate: Date | null;
  attachments: GmailAttachment[];
};

function getHeader(headers: Array<{ name?: string | null; value?: string | null }> | undefined, name: string) {
  return headers?.find((header) => header.name?.toLowerCase() === name.toLowerCase())?.value ?? null;
}

function collectAttachments(
  parts: Array<{ filename?: string | null; mimeType?: string | null; body?: { attachmentId?: string | null }; parts?: unknown }> | undefined,
): GmailAttachment[] {
  if (!parts) {
    return [];
  }

  const attachments: GmailAttachment[] = [];

  for (const part of parts) {
    if (part.filename && part.body?.attachmentId) {
      attachments.push({
        attachmentId: part.body.attachmentId,
        fileName: part.filename,
        mimeType: part.mimeType ?? "application/octet-stream",
      });
    }

    const nestedParts = part.parts as typeof parts | undefined;
    attachments.push(...collectAttachments(nestedParts));
  }

  return attachments;
}

export function createGmailClient(input: GmailClientInput) {
  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI,
  );

  auth.setCredentials({ refresh_token: input.refreshToken });
  return google.gmail({ version: "v1", auth });
}

export async function listGmailMessages(input: {
  gmail: ReturnType<typeof createGmailClient>;
  query?: string;
  maxResults?: number;
}) {
  const listed = await input.gmail.users.messages.list({
    userId: "me",
    q: input.query ?? "has:attachment newer_than:30d",
    maxResults: input.maxResults ?? 10,
  });

  const messages = listed.data.messages ?? [];
  const detailed = await Promise.all(
    messages.map(async (message) => {
      if (!message.id) {
        return null;
      }

      const result = await input.gmail.users.messages.get({
        userId: "me",
        id: message.id,
        format: "full",
      });

      const payload = result.data.payload;
      const internalDate = result.data.internalDate
        ? new Date(Number(result.data.internalDate))
        : null;

      return {
        id: message.id,
        threadId: result.data.threadId,
        historyId: result.data.historyId,
        subject: getHeader(payload?.headers, "subject"),
        from: getHeader(payload?.headers, "from"),
        snippet: result.data.snippet ?? null,
        internalDate,
        attachments: collectAttachments(payload?.parts),
      } satisfies GmailMessage;
    }),
  );

  return detailed.filter((message): message is GmailMessage => Boolean(message));
}

export async function downloadGmailAttachment(input: {
  gmail: ReturnType<typeof createGmailClient>;
  messageId: string;
  attachment: GmailAttachment;
}) {
  const result = await input.gmail.users.messages.attachments.get({
    userId: "me",
    messageId: input.messageId,
    id: input.attachment.attachmentId,
  });

  const data = result.data.data;
  if (!data) {
    throw new Error(`Gmail attachment ${input.attachment.attachmentId} has no data`);
  }

  return Buffer.from(data, "base64url");
}
