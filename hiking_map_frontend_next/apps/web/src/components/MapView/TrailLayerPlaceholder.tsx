import { Map } from 'lucide-react';

export default function TrailLayerPlaceholder() {
  return (
    <div className="bg-panel rounded-panel flex h-125 w-full items-center justify-center">
      <div className="text-background-contrary/40 flex flex-col items-center gap-2">
        <Map className="h-12 w-12" />
        <span className="text-sm">地圖尚未串接</span>
      </div>
    </div>
  );
}
