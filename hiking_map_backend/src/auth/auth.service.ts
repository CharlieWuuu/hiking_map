// src/auth/auth.service.ts
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User, UsersLog } from '../auth/auth.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepo: Repository<User>,

    @InjectRepository(UsersLog)
    private logRepo: Repository<UsersLog>,

    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<User | null> {
    const result = await this.usersRepo.query(
      `SELECT * FROM users WHERE username = $1 AND password = $2 LIMIT 1`,
      [username, password],
    );

    const user = result[0];
    return user ?? null;
  }

  async login(user: User, ip: string, ua: string, uuid: string) {
    const payload = { id: user.id, username: user.username, uuid: user.uuid };
    const token = this.jwtService.sign(payload);

    await this.logRepo.insert({
      user_id: user.id,
      ip_address: ip,
      user_agent: ua,
      uuid: uuid,
    });

    return { token };
  }
}
