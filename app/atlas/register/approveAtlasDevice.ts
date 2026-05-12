export type ApproveState =
  | "idle"
  | "loading"
  | "approved"
  | "sign_in_required"
  | "not_found"
  | "expired"
  | "already_processed"
  | "denied"
  | "unavailable"
  | "network_error";

export type ApproveOutcome = Exclude<ApproveState, "idle" | "loading">;

export async function submitApprovalRequest(
  deviceCode: string,
  fetchFn: typeof fetch = fetch,
): Promise<ApproveOutcome> {
  let res: Response;
  try {
    res = await fetchFn("/api/atlas/devices/register/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ device_code: deviceCode }),
    });
  } catch {
    return "network_error";
  }

  if (res.ok) return "approved";

  let errorCode = "";
  try {
    const data = (await res.json()) as { error?: { code?: string } };
    errorCode = data.error?.code ?? "";
  } catch {
    // ignore parse errors
  }

  if (res.status === 401) return "sign_in_required";
  if (res.status === 404) return "not_found";
  if (res.status === 409) {
    if (errorCode === "REGISTRATION_EXPIRED") return "expired";
    if (errorCode === "REGISTRATION_DENIED") return "denied";
    return "already_processed";
  }
  return "unavailable";
}
