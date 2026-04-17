export type DocumentStatus = "empty" | "uploaded" | "from_settings";

export type DocumentCategory =
  | "legal"
  | "financial"
  | "operational"
  | "commercial";

export type TenantDocument = {
  id: string;
  tenantId: string;

  category: DocumentCategory;

  title: string;
  description: string;

  status: DocumentStatus;

  fileUrl?: string;
  fileName?: string;

  source: "assessment" | "settings";

  createdAt: string;
  updatedAt: string;
};