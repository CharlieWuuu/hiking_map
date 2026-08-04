import type { Auth } from '../generated/Auth';

export function createAuthService(client: Auth) {
  return {
    register: (data: { username: string; password: string }) => client.authControllerRegister(data),
    login: (data: { username: string; password: string }) => client.authControllerLogin(data),
    logout: () => client.authControllerLogout(),
  };
}
