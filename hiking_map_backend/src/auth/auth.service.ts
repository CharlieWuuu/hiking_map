// src/auth/auth.service.ts
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from './auth.entity';
import { AuditLog } from '../common/entities/audit-log.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepo: Repository<User>,

    @InjectRepository(AuditLog)
    private auditLogRepo: Repository<AuditLog>,

    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<User | null> {
    const user = await this.usersRepo.findOne({ where: { username } });
    if (!user) return null;

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return null;

    return user;
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
