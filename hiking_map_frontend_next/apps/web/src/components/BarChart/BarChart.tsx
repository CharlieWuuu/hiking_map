type Props = {
  data: { label: string; value: number }[];
};

export default function BarChart({ data }: Props) {
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="flex h-40 w-full items-end gap-2">
      {data.map((d) => (
        <div key={d.label} className="flex flex-1 flex-col items-center gap-1">
          <div className="bg-accent w-full rounded-t" style={{ height: `${(d.value / max) * 100}%` }} />
          <span className="text-background-contrary/60 text-xs">{d.label}</span>
        </div>
      ))}
    </div>
  );
}
