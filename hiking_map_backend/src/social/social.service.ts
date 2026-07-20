import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Collection } from './collection.entity';
import { Follow } from './follow.entity';
import { CreateCollectionDto } from './dto/create-collection.dto';

@Injectable()
export class SocialService {
  constructor(
    @InjectRepository(Collection)
    private collectionsRepo: Repository<Collection>,

    @InjectRepository(Follow)
    private followsRepo: Repository<Follow>,
  ) {}

  async addCollection(userId: number, dto: CreateCollectionDto) {
    const existing = await this.collectionsRepo.findOne({
      where: { user_id: userId, item_type: dto.item_type, item_id: dto.item_id },
    });
    if (existing) throw new ConflictException('已經收藏過了');

    return this.collectionsRepo.save({
      user_id: userId,
      item_type: dto.item_type,
      item_id: dto.item_id,
    });
  }

  async removeCollection(userId: number, id: number) {
    const collection = await this.collectionsRepo.findOne({ where: { id } });
    if (!collection) throw new NotFoundException('找不到這筆收藏');
    if (collection.user_id !== userId) throw new NotFoundException('找不到這筆收藏');

    await this.collectionsRepo.delete(id);
  }

  findCollections(userId: number) {
    return this.collectionsRepo.find({ where: { user_id: userId }, order: { created_at: 'DESC' } });
  }

  async follow(followerUserId: number, followingUserId: number) {
    if (followerUserId === followingUserId) {
      throw new ConflictException('無法追蹤自己');
    }

    const existing = await this.followsRepo.findOne({
      where: { follower_user_id: followerUserId, following_user_id: followingUserId },
    });
    if (existing) throw new ConflictException('已經追蹤過了');

    return this.followsRepo.save({
      follower_user_id: followerUserId,
      following_user_id: followingUserId,
    });
  }

  async unfollow(followerUserId: number, followingUserId: number) {
    await this.followsRepo.delete({
      follower_user_id: followerUserId,
      following_user_id: followingUserId,
    });
  }

  findFollowing(userId: number) {
    return this.followsRepo.find({ where: { follower_user_id: userId } });
  }

  findFollowers(userId: number) {
    return this.followsRepo.find({ where: { following_user_id: userId } });
  }
}
