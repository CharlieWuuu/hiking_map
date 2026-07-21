import type { Auth } from '../api/Auth';

export function createAuthService(client: Auth) {
  return {
    register: (data: { username: string; password: string }) => client.authControllerRegister(data),
    login: (data: { username: string; password: string }) => client.authControllerLogin(data),
  };
}
