import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Profile } from './profile.entity';
import { User } from '../auth/auth.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(Profile)
    private profilesRepo: Repository<Profile>,

    @InjectRepository(User)
    private usersRepo: Repository<User>,
  ) {}

  async findByUserId(userId: number) {
    const profile = await this.profilesRepo.findOne({ where: { user_id: userId } });
    if (!profile) throw new NotFoundException('找不到個人檔案');
    return profile;
  }

  async findByUsername(username: string) {
    const user = await this.usersRepo.findOne({ where: { username } });
    if (!user) throw new NotFoundException('找不到使用者');

    const profile = await this.profilesRepo.findOne({ where: { user_id: user.id } });
    if (!profile) throw new NotFoundException('找不到個人檔案');

    return { username: user.username, ...profile };
  }

  async update(userId: number, dto: UpdateProfileDto) {
    const profile = await this.findByUserId(userId);
    await this.profilesRepo.update(profile.id, dto);
    return this.findByUserId(userId);
  }
}
