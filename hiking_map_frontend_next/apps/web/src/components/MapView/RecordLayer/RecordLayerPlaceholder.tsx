import { Map } from 'lucide-react';

export default function RecordLayerPlaceholder() {
  return (
    <div className="bg-panel rounded-panel flex h-100 w-full items-center justify-center">
      <div className="text-background-contrary/40 flex flex-col items-center gap-2">
        <Map className="h-12 w-12" />
      </div>
    </div>
  );
}
