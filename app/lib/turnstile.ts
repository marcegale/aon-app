export async function validarTurnstile(token: string) {
  if (!process.env.TURNSTILE_SECRET_KEY) {
    throw new Error("Falta TURNSTILE_SECRET_KEY");
  }

  const formData = new FormData();
  formData.append("secret", process.env.TURNSTILE_SECRET_KEY);
  formData.append("response", token);

  const response = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      body: formData,
    }
  );

  const data = await response.json();
  return data;
}