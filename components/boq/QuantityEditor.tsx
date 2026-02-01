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

function formatFixed(n: number): string {
    return n.toFixed(2);
}

export function QuantityEditor({
    value,
    onChange,
    step = 1,
    min = 0,
    className,
}: QuantityEditorProps) {
    const inputRef = React.useRef<HTMLInputElement | null>(null);
    const [isFocused, setIsFocused] = React.useState(false);

    const [draft, setDraft] = React.useState<string>(
        Number.isFinite(value) ? formatFixed(value) : "0.00"
    );

    // Sync draft when external value changes (stepper/reset/load)
    React.useEffect(() => {
        if (!isFocused) {
            const next = Number.isFinite(value) ? formatFixed(value) : "0.00";
            if (next !== draft) setDraft(next);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value, isFocused]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const sanitized = sanitizeDecimal(e.target.value);
        setDraft(sanitized);
        // Call onChange immediately for realtime price calculation
        const num = Number.parseFloat(sanitized);
        if (Number.isFinite(num)) {
            onChange(clampMin(num, min));
        }
    };

    const handleBlur = () => {
        setIsFocused(false);
        const d = draft.trim();
        if (d === "" || d === ".") {
            const v = clampMin(0, min);
            onChange(v);
            setDraft(formatFixed(v));
            return;
        }
        const num = Number.parseFloat(d);
        const safe = Number.isFinite(num) ? clampMin(num, min) : clampMin(0, min);
        onChange(safe);
        setDraft(formatFixed(safe));
    };

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
                onChange={handleChange}
                onBlur={handleBlur}
                onFocus={(e) => {
                    setIsFocused(true);
                    e.currentTarget.select();
                }}
                onKeyDown={(e) => {
                    if (e.key === "Enter") {
                        handleBlur();
                        inputRef.current?.blur();
                    }
                }}
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
