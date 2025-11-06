export type TrailProperties = {
  id: string;
  uuid: string;
  name: string;
  length: number;
  time: string;
  county: string;
  town: string;
  url: string[];
  note: string;
  public: boolean;
  hundred_id: string | null;
  small_hundred_id: string | null;
  hundred_trail_id: string | null;
};

export type PatchTrailData = Omit<TrailProperties, 'id' | 'uuid' | 'length'>;

export interface TrailEditorProps {
  trails: TrailProperties;
}
