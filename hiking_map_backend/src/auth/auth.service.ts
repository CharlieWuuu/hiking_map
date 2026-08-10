// src/auth/auth.service.ts
import { BadRequestException, ConflictException, Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from './auth.entity';
import { AuditLog } from '../common/entities/audit-log.entity';
import { Profile } from '../profile/profile.entity';
import { GoogleProfile } from './google.strategy';
import { PasswordResetToken } from './password-reset-token.entity';
import { MailService } from '../mail/mail.service';
import { randomBytes, createHash } from 'crypto';
import { IsNull, LessThan, MoreThan } from 'typeorm';

// 一小時足夠使用者去收信，又不會讓一條連結長期有效
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000;

// 明碼 token 只在信裡出現一次，資料庫存的是它的 SHA-256
function hashToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepo: Repository<User>,

    @InjectRepository(Profile)
    private profilesRepo: Repository<Profile>,

    @InjectRepository(AuditLog)
    private auditLogRepo: Repository<AuditLog>,

    @InjectRepository(PasswordResetToken)
    private resetTokensRepo: Repository<PasswordResetToken>,

    private jwtService: JwtService,

    private mailService: MailService,
  ) {}

  private readonly logger = new Logger(AuthService.name);

  async register(username: string, password: string, email?: string): Promise<User> {
    const existing = await this.usersRepo.findOne({ where: { username } });
    if (existing) throw new ConflictException('帳號已被使用');

    if (email) await this.assertEmailAvailable(email);

    const hashed = await bcrypt.hash(password, 10);
    const user = await this.usersRepo.save({ username, password: hashed, email: email ?? null });

    await this.profilesRepo.save({
      user_id: user.id,
      avatar: '',
      description: '',
    });

    return user;
  }

  async validateUser(username: string, password: string): Promise<User | null> {
    const user = await this.usersRepo.findOne({ where: { username } });
    if (!user || !user.password) return null;

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return null;

    return user;
  }

  async findOrCreateGoogleUser(profile: GoogleProfile): Promise<User> {
    const existing = await this.usersRepo.findOne({ where: { google_id: profile.googleId } });
    if (existing) return existing;

    const baseUsername = (profile.email?.split('@')[0] || profile.displayName).replace(/[^a-zA-Z0-9_]/g, '') || 'hiker';
    let username = baseUsername;
    let suffix = 0;
    while (await this.usersRepo.findOne({ where: { username } })) {
      suffix += 1;
      username = `${baseUsername}${suffix}`;
    }

    const user = await this.usersRepo.save({ username, password: null, google_id: profile.googleId });

    await this.profilesRepo.save({
      user_id: user.id,
      avatar: '',
      description: '',
    });

    return user;
  }

  private async assertEmailAvailable(email: string, exceptUserId?: number) {
    const existing = await this.usersRepo.findOne({ where: { email } });
    if (existing && existing.id !== exceptUserId) {
      throw new ConflictException('這個 email 已經被其他帳號使用');
    }
  }

  async setEmail(userId: number, email: string) {
    await this.assertEmailAvailable(email, userId);
    await this.usersRepo.update(userId, { email });
  }

  // 把 Google 帳號綁到現有帳號上，之後忘記密碼也能靠 Google 進來
  async linkGoogle(userId: number, googleId: string) {
    const existing = await this.usersRepo.findOne({ where: { google_id: googleId } });
    if (existing && existing.id !== userId) {
      throw new ConflictException('這個 Google 帳號已經綁在其他帳號上');
    }
    await this.usersRepo.update(userId, { google_id: googleId });
  }

  async unlinkGoogle(userId: number) {
    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user) throw new BadRequestException('找不到使用者');
    // 只有 Google 可以登入的帳號解綁後就再也進不來了
    if (!user.password) {
      throw new BadRequestException('這個帳號沒有設定密碼，解除綁定後將無法登入');
    }
    await this.usersRepo.update(userId, { google_id: null });
  }

  // 無論 email 存不存在都回傳成功，否則這支 API 會變成帳號存在與否的查詢工具
  async requestPasswordReset(email: string, frontendUrl: string) {
    const user = await this.usersRepo.findOne({ where: { email } });
    if (!user) {
      this.logger.log(`收到 ${email} 的密碼重設請求，但沒有對應的帳號`);
      return;
    }

    // 同一個人重複點「忘記密碼」時，舊的連結立刻失效
    await this.resetTokensRepo.update({ user_id: user.id, used_at: IsNull() }, { used_at: new Date() });

    const token = randomBytes(32).toString('hex');
    await this.resetTokensRepo.insert({
      user_id: user.id,
      token_hash: hashToken(token),
      expires_at: new Date(Date.now() + RESET_TOKEN_TTL_MS),
    });

    const link = `${frontendUrl}/reset-password?token=${token}`;
    await this.mailService.send(
      email,
      '重設你的健行軌跡密碼',
      `<p>你好 ${user.username}，</p>
       <p>點下面的連結重設密碼，一小時內有效：</p>
       <p><a href="${link}">${link}</a></p>
       <p>如果不是你本人操作，忽略這封信即可，密碼不會有任何變動。</p>`,
    );
  }

  async resetPassword(token: string, newPassword: string) {
    const record = await this.resetTokensRepo.findOne({
      where: { token_hash: hashToken(token), used_at: IsNull(), expires_at: MoreThan(new Date()) },
    });
    if (!record) throw new BadRequestException('連結已失效，請重新申請');

    const hashed = await bcrypt.hash(newPassword, 10);
    await this.usersRepo.update(record.user_id, { password: hashed });
    await this.resetTokensRepo.update(record.id, { used_at: new Date() });
  }

  // 過期的 token 留著也沒用，順手清掉
  async purgeExpiredResetTokens() {
    await this.resetTokensRepo.delete({ expires_at: LessThan(new Date()) });
  }

  async login(user: User, ip: string, ua: string) {
    const payload = { sub: user.id, username: user.username };
    const token = this.jwtService.sign(payload);

    await this.auditLogRepo.insert({
      user_id: user.id,
      action: 'login',
      ip_address: ip,
      user_agent: ua,
    });

    return { token };
  }
}
