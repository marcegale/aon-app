import { NextResponse } from "next/server";
import { validatePollBody } from "../_lib/registrationValidation.ts";
import {
  pickupApprovedRegistrationByDeviceCode,
  type PickupStatusResult,
} from "../../../_lib/atlasRegistrationStore.ts";

export const runtime = "nodejs";

type GetPickupStatusFn = (device_code: string) => Promise<PickupStatusResult>;

type PollDeps = { pickupApprovedRegistrationByDeviceCode: GetPickupStatusFn };

export function createPollPostHandler(
  deps: PollDeps = { pickupApprovedRegistrationByDeviceCode },
) {
  return async function POST(request: Request): Promise<Response> {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { ok: false, error: { code: "INVALID_REQUEST", message: "Invalid JSON body." } },
        { status: 400 },
      );
    }

    const validation = validatePollBody(body);
    if (!validation.ok) {
      return NextResponse.json(
        { ok: false, error: validation.error },
        { status: 400 },
      );
    }

    const b = body as { device_code: string };
    const result = await deps.pickupApprovedRegistrationByDeviceCode(b.device_code);

    if (!result.ok) {
      if (result.code === "NOT_FOUND") {
        return NextResponse.json(
          { ok: false, error: { code: "DEVICE_CODE_NOT_FOUND", message: "Device code not found or expired." } },
          { status: 404 },
        );
      }
      if (result.code === "SECRET_NOT_CONFIGURED") {
        return NextResponse.json(
          { ok: false, error: { code: "NOT_CONFIGURED", message: "Device registration is not configured." } },
          { status: 503 },
        );
      }
      return NextResponse.json(
        { ok: false, error: { code: "REGISTRATION_UNAVAILABLE", message: "Device registration is unavailable. Try again." } },
        { status: 503 },
      );
    }

    if (result.status === "approved") {
      return NextResponse.json(
        { ok: true, status: result.status, device_key: result.device_key },
        { status: 200 },
      );
    }

    return NextResponse.json(
      { ok: true, status: result.status },
      { status: 200 },
    );
  };
}

export const POST = createPollPostHandler();

export async function GET() {
  return NextResponse.json(
    { ok: false, error: { code: "INVALID_METHOD", message: "Method not allowed." } },
    { status: 405 },
  );
}
