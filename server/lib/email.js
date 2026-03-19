import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // Использование SSL (порт 465) надежнее для Railway/VPS
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  pool: true,
  maxConnections: 1,
});

export async function sendVerificationEmail(to, code) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    const msg = "SMTP credentials (USER/PASS) are missing in .env!";
    console.error(`[EMAIL CONFIG ERROR] ${msg}`);
    return { ok: false, error: msg };
  }

  try {
    await transporter.sendMail({
      from: `"PAPPY" <${process.env.SMTP_USER}>`,
      to,
      subject: "Код подтверждения PAPPY",
      text: `Ваш код подтверждения для регистрации: ${code}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; background: #0a0a0f; color: white; border-radius: 10px; border: 1px solid #7B2EFF;">
          <h2 style="color: #7B2EFF; text-align: center;">Добро пожаловать в PAPPY!</h2>
          <p style="text-align: center;">Используйте этот код для завершения регистрации:</p>
          <div style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #39FF14; margin: 20px 0; text-align: center; background: rgba(255,255,255,0.05); padding: 15px; border-radius: 8px;">
            ${code}
          </div>
          <p style="font-size: 12px; color: rgba(255,255,255,0.4); text-align: center;">Если вы не запрашивали этот код, просто проигнорируйте это письмо.</p>
        </div>
      `,
    });
    console.log(`[EMAIL SUCCESS] Sent to ${to}`);
    return { ok: true };
  } catch (error) {
    console.error("[EMAIL ERROR DETAILS]", error);
    return { ok: false, error: error.message };
  }
}
