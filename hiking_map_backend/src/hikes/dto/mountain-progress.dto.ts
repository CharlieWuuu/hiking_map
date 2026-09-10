import { ApiProperty } from '@nestjs/swagger';

export class MountainProgressItemDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: '玉山主峰' })
  name: string;

  @ApiProperty({ example: 3952 })
  elevation_m: number;
}

export class MountainProgressCategoryDto {
  @ApiProperty({ type: [MountainProgressItemDto] })
  completed: MountainProgressItemDto[];

  @ApiProperty({ type: [MountainProgressItemDto] })
  missing: MountainProgressItemDto[];
}

export class MountainProgressDto {
  @ApiProperty({ type: MountainProgressCategoryDto })
  hundred: MountainProgressCategoryDto;

  @ApiProperty({ type: MountainProgressCategoryDto })
  small_hundred: MountainProgressCategoryDto;
}
