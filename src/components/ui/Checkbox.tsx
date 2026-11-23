interface CheckboxProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  description?: string;
}

export function Checkbox({ label, checked, onChange, description }: CheckboxProps) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-2 text-[13px] text-fg" title={description}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 cursor-pointer rounded border-border-strong accent-[var(--accent)]"
      />
      <span>{label}</span>
    </label>
  );
}
