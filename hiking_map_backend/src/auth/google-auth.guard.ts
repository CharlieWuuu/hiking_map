import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// 同一組 OAuth 流程有兩種用途：登入，以及把 Google 綁到已登入的帳號上。
// 用 state 把意圖帶去 Google 再原封不動帶回來，callback 才分得出來。
export const GOOGLE_LINK_STATE = 'link';

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  getAuthenticateOptions(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    return request.query?.mode === GOOGLE_LINK_STATE ? { state: GOOGLE_LINK_STATE } : {};
  }
}
