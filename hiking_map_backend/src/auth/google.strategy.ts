import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';

export type GoogleProfile = {
  googleId: string;
  email: string | null;
  displayName: string;
};

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor() {
    super({
      // passport-oauth2 建構子會強制檢查 clientID/clientSecret 不得為空字串，
      // 尚未設定環境變數時用 placeholder 讓應用能正常啟動，實際呼叫 /auth/google
      // 時 Google 會回傳 invalid_client。
      clientID: process.env.GOOGLE_CLIENT_ID || 'placeholder',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'placeholder',
      callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3001/auth/google/callback',
      scope: ['profile', 'email'],
    });
  }

  validate(_accessToken: string, _refreshToken: string, profile: any, done: VerifyCallback) {
    const googleProfile: GoogleProfile = {
      googleId: profile.id,
      email: profile.emails?.[0]?.value ?? null,
      displayName: profile.displayName,
    };
    done(null, googleProfile);
  }
}
