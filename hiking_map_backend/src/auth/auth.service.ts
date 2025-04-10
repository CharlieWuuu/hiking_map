// src/auth/auth.service.ts
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { UsersLog } from '../logs/users-log.entity';

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
    const user = await this.usersRepo.findOne({
      where: { username, password },
    });
    return user ?? null;
  }

  async login(user: User, ip: string, ua: string) {
    const payload = { username: user.username, sub: user.id };
    const token = this.jwtService.sign(payload);

    await this.logRepo.insert({
      user_id: user.id,
      ip_address: ip,
      user_agent: ua,
    });

    return { token };
  }
}
