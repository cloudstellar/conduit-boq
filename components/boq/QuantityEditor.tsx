"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MAX_QUANTITY, formatQuantity, parseQuantityDraft } from "@/lib/boq/quantityInput";
import { Minus, Plus } from "lucide-react";

type QuantityEditorProps = {
    value: number;
    draft?: string;
    error?: string;
    onDraftChange: (text: string) => void;
    onCommit: () => void;
    onCancel: () => void;
    onStep: (delta: number) => void;
    step?: number; // default 1
    min?: number;  // default 0
    className?: string;
    disabled?: boolean;
    ariaLabel?: string;
};

export function QuantityEditor({
    value,
    draft,
    error,
    onDraftChange,
    onCommit,
    onCancel,
    onStep,
    step = 1,
    min = 0,
    className,
    disabled = false,
    ariaLabel = "ปริมาณ",
}: QuantityEditorProps) {
    const errorId = React.useId();
    const sourceHintId = React.useId();
    const displayValue = draft ?? formatQuantity(value);
    // Formatting an existing value must not make it eligible for a numeric
    // edit that the parent correctly rejects against the original value.
    const parsed = parseQuantityDraft(draft ?? String(value));
    const canStep = parsed.status === 'valid' && Number.isFinite(step) && step > 0;
    const stepValue = parsed.status === 'valid' ? parsed.value : 0;
    const sourceHint = draft === undefined && parsed.status !== 'valid'
        ? `ค่าเดิม ${String(value)} กรุณากรอกค่าที่ถูกต้องก่อนเพิ่มหรือลด (${parsed.message})`
        : undefined;

    // A pointer step/cancel is one explicit action; prevent an earlier blur
    // from committing the draft before that action reaches the parent.
    const preserveInputFocus = (event: React.PointerEvent<HTMLButtonElement>) => {
        if (event.button === 0) event.preventDefault();
    };

    return (
        <div className={`flex flex-col gap-1 ${className ?? ""}`}>
          <div className="flex items-center gap-1">
            <Button
                type="button"
                variant="outline"
                size="icon"
                onPointerDown={preserveInputFocus}
                onClick={() => onStep(-step)}
                aria-label={`ลด${ariaLabel}`}
                disabled={disabled || !canStep || stepValue <= Math.max(0, min)}
            >
                <Minus className="h-4 w-4" />
            </Button>

            <Input
                type="text"
                inputMode="decimal"
                enterKeyHint="done"
                aria-label={ariaLabel}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? errorId : sourceHint ? sourceHintId : undefined}
                title={sourceHint}
                value={displayValue}
                onChange={(event) => onDraftChange(event.target.value)}
                onBlur={onCommit}
                disabled={disabled}
                onFocus={(event) => event.currentTarget.select()}
                onKeyDown={(event) => {
                    if (event.nativeEvent.isComposing) return;
                    if (event.key === "Enter") {
                        event.preventDefault();
                        event.currentTarget.blur();
                    } else if (event.key === "Escape") {
                        event.preventDefault();
                        event.stopPropagation();
                        onCancel();
                    }
                }}
                className="h-10 w-24 sm:w-28 px-2 text-base tabular-nums text-right"
            />

            <Button
                type="button"
                variant="outline"
                size="icon"
                onPointerDown={preserveInputFocus}
                onClick={() => onStep(step)}
                aria-label={`เพิ่ม${ariaLabel}`}
                disabled={disabled || !canStep || stepValue + step > MAX_QUANTITY}
            >
                <Plus className="h-4 w-4" />
            </Button>
          </div>

            {/* Keep this row in the layout after blur so controls below the
                table cannot move away between pointerdown and click. */}
            <div className="h-8">
              {draft !== undefined && (
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onPointerDown={preserveInputFocus}
                    onClick={onCancel}
                    disabled={disabled}
                    aria-label={`ยกเลิกการแก้ไข${ariaLabel}`}
                    className="self-start"
                >
                    ยกเลิก
                </Button>
              )}
            </div>

            {sourceHint && (
                <p id={sourceHintId} className="max-w-64 text-xs text-muted-foreground">
                    {sourceHint}
                </p>
            )}

            {error && (
                <p id={errorId} role="alert" className="max-w-64 text-xs text-destructive">
                    {error}
                </p>
            )}
        </div>
    );
}
