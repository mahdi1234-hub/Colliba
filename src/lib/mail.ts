import nodemailer from "nodemailer";
import { env } from "./env";

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (transporter) return transporter;
  transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: { user: env.SMTP_USER, pass: env.SMTP_PASS }
  });
  return transporter;
}

const baseStyles = `
  body{margin:0;background:#f4f0e9;font-family:'Plus Jakarta Sans',system-ui,sans-serif;color:#181512}
  .wrap{max-width:560px;margin:0 auto;padding:48px 24px}
  .card{background:#fff;border:1px solid #d9d1c5;padding:32px}
  h1{font-family:'Instrument Serif',serif;font-weight:400;letter-spacing:-0.02em;font-size:28px;margin:0 0 12px;color:#181512}
  p{color:#5f5851;line-height:1.7;font-size:14px;margin:8px 0}
  .btn{display:inline-block;margin-top:20px;padding:12px 20px;background:#2F5D50;color:#fff;text-decoration:none;font-size:13px;letter-spacing:0.06em;text-transform:uppercase}
  .muted{color:#8a8178;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;margin-bottom:16px}
  .footer{color:#8a8178;font-size:12px;margin-top:24px;text-align:center}
  a.link{color:#2F5D50;word-break:break-all}
`;

function emailShell(heading: string, preheader: string, body: string) {
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${baseStyles}</style></head>
<body><div class="wrap"><div class="muted">Colliba</div><div class="card"><h1>${heading}</h1>${body}</div><div class="footer">${preheader}</div></div></body></html>`;
}

export async function sendVerificationEmail(to: string, verifyUrl: string) {
  const t = getTransporter();
  await t.sendMail({
    from: env.SMTP_FROM,
    to,
    subject: "Confirm your Colliba account",
    html: emailShell(
      "Welcome to Colliba.",
      "Confirm your email to start watching and publishing.",
      `<p>Confirm this email to activate your Colliba account. This link expires in 24 hours.</p>
       <a class="btn" href="${verifyUrl}">Confirm email</a>
       <p style="margin-top:20px;font-size:12px;">Or paste this URL into your browser:</p>
       <p><a class="link" href="${verifyUrl}">${verifyUrl}</a></p>`
    ),
    text: `Confirm your Colliba account: ${verifyUrl}`
  });
}

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  const t = getTransporter();
  await t.sendMail({
    from: env.SMTP_FROM,
    to,
    subject: "Reset your Colliba password",
    html: emailShell(
      "Reset password.",
      "A password reset was requested for your account.",
      `<p>A password reset was requested for this email. If it wasn't you, you can ignore this message. Otherwise, use the link below within the next hour.</p>
       <a class="btn" href="${resetUrl}">Reset password</a>
       <p style="margin-top:20px;font-size:12px;">Or paste this URL into your browser:</p>
       <p><a class="link" href="${resetUrl}">${resetUrl}</a></p>`
    ),
    text: `Reset your Colliba password: ${resetUrl}`
  });
}
