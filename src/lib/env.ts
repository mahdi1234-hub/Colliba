function required(name: string, fallback?: string): string {
  const v = process.env[name] ?? fallback;
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}

function optional(name: string): string | undefined {
  return process.env[name] || undefined;
}

export const env = {
  DATABASE_URL: required("DATABASE_URL", "postgresql://placeholder@localhost/placeholder"),
  AUTH_SECRET: required("AUTH_SECRET", "dev-insecure-secret-change-me-at-least-32-chars-long"),
  APP_URL: required("APP_URL", "http://localhost:3000"),
  SMTP_HOST: required("SMTP_HOST", "smtp.gmail.com"),
  SMTP_PORT: parseInt(required("SMTP_PORT", "465"), 10),
  SMTP_USER: required("SMTP_USER", "unset@example.com"),
  SMTP_PASS: required("SMTP_PASS", "unset"),
  SMTP_FROM: required("SMTP_FROM", "Colliba <unset@example.com>"),
  MUX_TOKEN_ID: optional("MUX_TOKEN_ID"),
  MUX_TOKEN_SECRET: optional("MUX_TOKEN_SECRET"),
  MUX_WEBHOOK_SECRET: optional("MUX_WEBHOOK_SECRET"),
  PARTYKIT_HOST: optional("NEXT_PUBLIC_PARTYKIT_HOST") ?? "127.0.0.1:1999"
};
