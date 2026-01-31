"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Minus, Plus } from "lucide-react";

type QuantityEditorProps = {
    value: number;
    onChange: (value: number) => void;
    step?: number; // default 1
    min?: number;  // default 0
    className?: string;
};

function sanitizeDecimal(s: string) {
    // allow digits + one dot only
    const cleaned = s.replace(/[^\d.]/g, "");
    const parts = cleaned.split(".");
    if (parts.length <= 2) return cleaned;
    return parts[0] + "." + parts.slice(1).join("");
}

function clampMin(n: number, min: number) {
    return n < min ? min : n;
}

export function QuantityEditor({
    value,
    onChange,
    step = 1,
    min = 0,
    className,
}: QuantityEditorProps) {
    const inputRef = React.useRef<HTMLInputElement | null>(null);

    const [draft, setDraft] = React.useState<string>(
        Number.isFinite(value) ? String(value) : "0"
    );

    // Sync draft when external value changes (stepper/reset/load)
    React.useEffect(() => {
        const next = Number.isFinite(value) ? String(value) : "0";
        // avoid cursor jump while typing
        if (next !== draft) setDraft(next);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value]);

    const commit = React.useCallback(() => {
        const d = draft.trim();
        if (d === "" || d === ".") {
            const v = clampMin(0, min);
            onChange(v);
            setDraft(String(v));
            return;
        }

        const num = Number.parseFloat(d);
        const safe = Number.isFinite(num) ? clampMin(num, min) : clampMin(0, min);
        onChange(safe);
        setDraft(String(safe));
    }, [draft, min, onChange]);

    return (
        <div className={`flex items-center gap-1 ${className ?? ""}`}>
            <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => onChange(clampMin((value || 0) - step, min))}
                aria-label="Decrease quantity"
            >
                <Minus className="h-4 w-4" />
            </Button>

            <Input
                ref={inputRef}
                type="text"
                inputMode="decimal"
                enterKeyHint="done"
                value={draft}
                onChange={(e) => setDraft(sanitizeDecimal(e.target.value))}
                onBlur={commit}
                onKeyDown={(e) => {
                    if (e.key === "Enter") {
                        commit();
                        inputRef.current?.blur();
                    }
                }}
                onFocus={(e) => e.currentTarget.select()}
                className="h-10 w-24 sm:w-28 px-2 text-base tabular-nums text-right"
            />

            <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => onChange((value || 0) + step)}
                aria-label="Increase quantity"
            >
                <Plus className="h-4 w-4" />
            </Button>
        </div>
    );
}
