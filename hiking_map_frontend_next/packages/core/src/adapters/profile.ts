import type { Profile as RawProfile, UpdateProfileDto as RawUpdateProfileDto } from '../api/data-contracts';
import type { Profile as ProfileClient } from '../api/Profile';
import { toCamelCase } from './case';

export type Profile = {
  id: number;
  userId: number;
  avatar: string;
  level: string;
  description: string;
};

export type UpdateProfileDto = {
  avatar?: string;
  level?: string;
  description?: string;
};

export function adaptProfile(raw: RawProfile): Profile {
  return toCamelCase<RawProfile>(raw) as Profile;
}

export function toUpdateProfileDto(dto: UpdateProfileDto): RawUpdateProfileDto {
  return {
    avatar: dto.avatar,
    level: dto.level,
    description: dto.description,
  };
}

export function createProfileService(client: ProfileClient) {
  return {
    getMe: async () => adaptProfile(await client.profileControllerGetMe()),
    updateMe: async (dto: UpdateProfileDto) => adaptProfile(await client.profileControllerUpdateMe(toUpdateProfileDto(dto))),
    getByUsername: async (username: string) => adaptProfile(await client.profileControllerGetByUsername(username)),
  };
}
