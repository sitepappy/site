import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendVerificationEmail(to, code) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn("[EMAIL] SMTP credentials not set. Code logged to console instead.");
    console.log(`\n==================================================\n[EMAIL VERIFICATION]\nTo: ${to}\nCode: ${code}\n==================================================\n`);
    return false;
  }

  try {
    await transporter.sendMail({
      from: `"PAPPY" <${process.env.SMTP_USER}>`,
      to,
      subject: "Код подтверждения PAPPY",
      text: `Ваш код подтверждения для регистрации: ${code}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; background: #0a0a0f; color: white; border-radius: 10px;">
          <h2 style="color: #7B2EFF;">Добро пожаловать в PAPPY!</h2>
          <p>Используйте этот код для завершения регистрации:</p>
          <div style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #39FF14; margin: 20px 0;">
            ${code}
          </div>
          <p style="font-size: 12px; color: rgba(255,255,255,0.4);">Если вы не запрашивали этот код, просто проигнорируйте это письмо.</p>
        </div>
      `,
    });
    return true;
  } catch (error) {
    console.error("[EMAIL ERROR]", error);
    return false;
  }
}
