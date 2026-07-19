'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  catalogMoneyInputError,
  normalizeCatalogMoneyInput,
} from '@/lib/master-catalog/admin/money';

export function CatalogMoneyInput({
  id,
  name,
  label,
  value,
  onChange,
  showError,
  onValidationRequest,
}: {
  id: string;
  name: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  showError: boolean;
  onValidationRequest: () => void;
}) {
  const error = showError ? catalogMoneyInputError(value, label) : null;
  const descriptionId = `${id}-error`;

  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        name={name}
        inputMode="decimal"
        autoComplete="off"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onBlur={() => {
          const normalized = normalizeCatalogMoneyInput(value);
          if (normalized) {
            onChange(normalized);
          } else {
            onValidationRequest();
          }
        }}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? descriptionId : undefined}
        required
      />
      {error ? (
        <p id={descriptionId} className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
