import { Injectable, Logger } from '@nestjs/common';

// 用 Resend 的 HTTP API 直接寄，不另外裝 SDK——只有一個端點，裝一包相依沒有划算到。
const RESEND_ENDPOINT = 'https://api.resend.com/emails';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  async send(to: string, subject: string, html: string): Promise<void> {
    const apiKey = process.env.RESEND_API_KEY;

    // 開發環境通常沒設金鑰。與其讓整個流程失敗，不如把信件內容印在 log 裡，
    // 這樣本機也能一路測到重設頁面
    if (!apiKey) {
      this.logger.warn(`沒有設定 RESEND_API_KEY，以下是原本要寄給 ${to} 的信：\n${subject}\n${html}`);
      return;
    }

    const response = await fetch(RESEND_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.MAIL_FROM || 'onboarding@resend.dev',
        to,
        subject,
        html,
      }),
    });

    if (!response.ok) {
      throw new Error(`寄信失敗：${response.status} ${await response.text()}`);
    }
  }
}
