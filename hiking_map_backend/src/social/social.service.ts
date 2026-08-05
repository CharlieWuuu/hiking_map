import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Collection } from './collection.entity';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { CollectionItemDto } from './dto/collection-item.dto';
import { User } from '../auth/auth.entity';
import { Profile } from '../profile/profile.entity';
import { Trail } from '../trails/trail.entity';

@Injectable()
export class SocialService {
  constructor(
    @InjectRepository(Collection)
    private collectionsRepo: Repository<Collection>,

    @InjectRepository(User)
    private usersRepo: Repository<User>,

    @InjectRepository(Profile)
    private profilesRepo: Repository<Profile>,

    @InjectRepository(Trail)
    private trailsRepo: Repository<Trail>,
  ) {}

  async addCollection(userId: number, dto: CreateCollectionDto) {
    const existing = await this.collectionsRepo.findOne({
      where: {
        user_id: userId,
        item_type: dto.item_type,
        item_id: dto.item_id,
      },
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
    if (collection.user_id !== userId)
      throw new NotFoundException('找不到這筆收藏');

    await this.collectionsRepo.delete(id);
  }

  async findCollections(userId: number): Promise<CollectionItemDto[]> {
    const collections = await this.collectionsRepo.find({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
    });
    if (collections.length === 0) return [];

    const trailIds = collections
      .filter((c) => c.item_type === 'trail')
      .map((c) => c.item_id);
    const userIds = collections
      .filter((c) => c.item_type === 'user')
      .map((c) => c.item_id);

    const trails = trailIds.length
      ? await this.trailsRepo.findBy({ id: In(trailIds) })
      : [];
    const trailsById = new Map(trails.map((trail) => [trail.id, trail]));

    const users = userIds.length
      ? await this.usersRepo.findBy({ id: In(userIds) })
      : [];
    const usersById = new Map(users.map((user) => [user.id, user]));
    const profiles = userIds.length
      ? await this.profilesRepo.findBy({ user_id: In(userIds) })
      : [];
    const profilesByUserId = new Map(
      profiles.map((profile) => [profile.user_id, profile]),
    );

    return collections.map((collection) => {
      if (collection.item_type === 'trail') {
        const trail = trailsById.get(collection.item_id);
        return {
          ...collection,
          trail_name: trail?.name ?? null,
          trail_slug: trail?.slug ?? null,
        };
      }
      if (collection.item_type === 'user') {
        const user = usersById.get(collection.item_id);
        const profile = profilesByUserId.get(collection.item_id);
        return {
          ...collection,
          username: user?.username ?? null,
          avatar: profile?.avatar ?? null,
        };
      }
      return { ...collection };
    });
  }
}
