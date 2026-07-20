'use client';

type Props = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
};

export default function Switch({ checked, onChange, disabled }: Props) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={disabled ? undefined : checked}
      onClick={() => onChange(!checked)}
      disabled={disabled}
      className={`relative block h-7 w-12 shrink-0 cursor-pointer rounded-full p-0 transition-colors ${
        disabled ? 'invisible' : checked ? 'bg-accent-darken' : 'bg-panel-active'
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow-md transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`}
      />
    </button>
  );
}
