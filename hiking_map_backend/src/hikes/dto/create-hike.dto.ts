import { FeatureCollection } from 'geojson';

export class CreateHikeDto {
  name: string;
  date: string;
  distance_km: number;
  is_public?: boolean;
  note?: string;
  trail_id?: number;
  category_ids?: number[];
  geojson: FeatureCollection;
}
