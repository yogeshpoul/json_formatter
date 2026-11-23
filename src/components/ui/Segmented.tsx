"use client";

import { useId } from "react";

interface SegmentedProps<T extends string> {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
  hideLabel?: boolean;
  disabled?: boolean;
}

/** Accessible single-choice control built on native radio inputs. */
export function Segmented<T extends string>({ label, value, options, onChange, hideLabel, disabled }: SegmentedProps<T>) {
  const id = useId();
  return (
    <div className="flex items-center gap-2">
      <span id={`${id}-label`} className={hideLabel ? "sr-only" : "text-[13px] text-muted"}>
        {label}
      </span>
      <div
        role="radiogroup"
        aria-labelledby={`${id}-label`}
        className="inline-flex rounded-md border border-border bg-surface-2 p-0.5"
      >
        {options.map((option) => {
          const checked = option.value === value;
          return (
            <label
              key={option.value}
              className={`relative cursor-pointer rounded-[5px] px-2.5 py-1 text-[13px] font-medium transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-1 has-[:focus-visible]:outline-accent ${
                checked ? "bg-surface text-fg shadow-card" : "text-muted hover:text-fg"
              } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
            >
              <input
                type="radio"
                name={id}
                value={option.value}
                checked={checked}
                disabled={disabled}
                onChange={() => onChange(option.value)}
                className="sr-only"
              />
              {option.label}
            </label>
          );
        })}
      </div>
    </div>
  );
}
