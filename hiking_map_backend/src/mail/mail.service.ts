import { Injectable, Logger } from '@nestjs/common';
import { createTransport, Transporter } from 'nodemailer';

// 用 Gmail 的 SMTP 寄信。
//
// MAIL_PASSWORD 必須是 Google 的「應用程式密碼」，不是你登入 Gmail 的密碼——
// Google 早就不接受帳號密碼登入 SMTP 了。產生方式見 .env.example。
//
// ⚠️ 部分部署平台會封鎖對外的 SMTP port（25/465/587）來防止濫發垃圾信。
// 若正式環境寄不出去而本機正常，多半就是這個原因，屆時需改用 HTTP API 型的服務。
@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: Transporter | null = null;

  private getTransporter(): Transporter | null {
    const user = process.env.MAIL_USER;
    const pass = process.env.MAIL_PASSWORD;
    if (!user || !pass) return null;

    // 連線資訊不會變，建一次就好
    this.transporter ??= createTransport({
      service: 'gmail',
      auth: { user, pass },
    });
    return this.transporter;
  }

  async send(to: string, subject: string, html: string): Promise<void> {
    const transporter = this.getTransporter();

    // 開發環境通常沒設帳密。與其讓整個流程失敗，不如把信件內容印在 log 裡，
    // 這樣本機也能一路測到重設頁面
    if (!transporter) {
      this.logger.warn(`沒有設定 MAIL_USER / MAIL_PASSWORD，以下是原本要寄給 ${to} 的信：\n${subject}\n${html}`);
      return;
    }

    await transporter.sendMail({
      from: process.env.MAIL_FROM || process.env.MAIL_USER,
      to,
      subject,
      html,
    });
  }
}
