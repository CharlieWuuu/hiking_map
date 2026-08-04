import { ApiProperty } from '@nestjs/swagger';

export class MonthlyDistanceDto {
  @ApiProperty({ example: '2026-06' })
  month: string;

  @ApiProperty({ example: 15.8 })
  distance_km: number;
}

export class CountyStatDto {
  @ApiProperty({ example: '南投縣' })
  county: string;

  @ApiProperty({ example: 4 })
  count: number;
}

export class AchievementsDto {
  @ApiProperty({ example: 12 })
  hundred: number;

  @ApiProperty({ example: 28 })
  small_hundred: number;

  @ApiProperty({ example: 45 })
  hundred_trail: number;
}

export class HikeStatsDto {
  @ApiProperty({ example: 128.6 })
  total_distance_km: number;

  @ApiProperty({ example: 24 })
  hike_count: number;

  @ApiProperty({ type: AchievementsDto })
  achievements: AchievementsDto;

  @ApiProperty({ type: [MonthlyDistanceDto] })
  monthly_distance: MonthlyDistanceDto[];

  @ApiProperty({ type: [CountyStatDto] })
  county_stats: CountyStatDto[];
}
