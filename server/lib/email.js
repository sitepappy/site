import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // Использование STARTTLS (порт 587) часто лучше работает на облачных хостингах
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  connectionTimeout: 10000, // 10 секунд на подключение
  greetingTimeout: 10000,
  socketTimeout: 10000,
});

export async function sendVerificationEmail(to, code) {
  // Логируем наличие переменных (скрывая пароль частично)
  console.log(`[EMAIL ATTEMPT] Sending to: ${to}`);
  console.log(`[EMAIL CONFIG] USER: ${process.env.SMTP_USER ? 'SET' : 'MISSING'}, PASS: ${process.env.SMTP_PASS ? 'SET' : 'MISSING'}`);

  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    const msg = "Данные почты (USER/PASS) не найдены в переменных окружения Railway!";
    console.error(`[EMAIL ERROR] ${msg}`);
    // Если переменных нет, пишем код в консоль, чтобы вы могли зарегаться
    console.log(`\n!!! ВНИМАНИЕ: КОД ДЛЯ ${to} -> ${code} !!!\n`);
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
    // В случае ошибки соединения, всё равно пишем код в консоль сервера, чтобы не стопорить вас
    console.log(`\n!!! ОШИБКА ПОЧТЫ, КОД ДЛЯ ${to} -> ${code} !!!\n`);
    return { ok: false, error: error.message };
  }
}
