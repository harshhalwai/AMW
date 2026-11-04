import { useState } from "react";
import { cn } from "../utils/utils";

interface Props {
  value: string; // digit sequence e.g. "14789"
  onChange: (v: string) => void;
  readOnly?: boolean;
}
export function PatternInput({ value, onChange, readOnly }: Props) {
  const [drawing, setDrawing] = useState(false);
  const seq = value.split("").map(Number).filter(n => n >= 1 && n <= 9);

  const add = (n: number) => {
    if (readOnly) return;
    if (seq.includes(n)) return;
    onChange([...seq, n].join(""));
  };
  const reset = () => onChange("");

  return (
    <div className="inline-flex flex-col gap-2">
      <div
        className="grid grid-cols-3 gap-3 p-4 rounded-xl bg-muted border border-border w-fit"
        onMouseDown={() => setDrawing(true)}
        onMouseUp={() => setDrawing(false)}
        onMouseLeave={() => setDrawing(false)}
      >
        {Array.from({ length: 9 }).map((_, i) => {
          const n = i + 1;
          const idx = seq.indexOf(n);
          const active = idx !== -1;
          return (
            <button
              type="button"
              key={n}
              onMouseDown={() => add(n)}
              onMouseEnter={() => drawing && add(n)}
              onClick={() => add(n)}
              className={cn(
                "size-12 rounded-full border-2 grid place-items-center text-sm font-semibold transition-all",
                active
                  ? "bg-primary text-primary-foreground border-primary shadow-glow"
                  : "bg-background border-border hover:border-primary/50",
              )}
            >
              {active ? idx + 1 : ""}
            </button>
          );
        })}
      </div>
      {!readOnly && (
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Sequence: <span className="font-mono text-foreground">{value || "—"}</span></span>
          <button type="button" onClick={reset} className="text-primary hover:underline">Reset</button>
        </div>
      )}
    </div>
  );
}
