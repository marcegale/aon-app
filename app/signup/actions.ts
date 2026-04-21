"use server";

import { createSupabaseAdminClient } from "../../lib/supabase/server";

type SignupState = {
  success: boolean;
  error: string | null;
};

export async function signupAction(
  _prevState: SignupState,
  formData: FormData
): Promise<SignupState> {
  const fullName = String(formData.get("fullName") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  const turnstileToken = String(formData.get("turnstileToken") || "");

  if (!fullName) {
    return { success: false, error: "Debes ingresar tu nombre completo." };
  }

  if (!email) {
    return { success: false, error: "Debes ingresar tu correo electrónico." };
  }

  if (!password || password.length < 8) {
    return {
      success: false,
      error: "La contraseña debe tener al menos 8 caracteres.",
    };
  }

  if (!turnstileToken) {
    return {
      success: false,
      error: "Debes completar la verificación de humano.",
    };
  }

  const turnstileSecretKey = process.env.TURNSTILE_SECRET_KEY;

  if (!turnstileSecretKey) {
    return {
      success: false,
      error: "TURNSTILE_SECRET_KEY no está configurada.",
    };
  }

  const verificationResponse = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        secret: turnstileSecretKey,
        response: turnstileToken,
      }),
    }
  );

  const verificationResult = await verificationResponse.json();

  if (!verificationResult.success) {
    return {
      success: false,
      error: "No se pudo validar la verificación humana.",
    };
  }

  const supabase = createSupabaseAdminClient();

  const { error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: false,
    user_metadata: {
      fullName,
    },
  });

  if (error) {
    return {
      success: false,
      error: error.message || "No se pudo crear la cuenta.",
    };
  }

  return {
    success: true,
    error: null,
  };
}