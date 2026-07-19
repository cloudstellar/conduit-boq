'use client';

import { useMemo, useState } from 'react';
import { Check, ChevronsUpDown, PencilLine } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export function CatalogUnitInput({
  id,
  name,
  value,
  options,
  onChange,
}: {
  id: string;
  name: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  const normalizedOptions = useMemo(
    () => [...new Set(options.map((option) => option.trim()).filter(Boolean))]
      .sort((left, right) => left.localeCompare(right, 'th-TH')),
    [options],
  );
  const [open, setOpen] = useState(false);
  const [custom, setCustom] = useState(
    Boolean(value.trim()) && !normalizedOptions.includes(value.trim()),
  );

  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{custom ? 'หน่วยนับอื่น' : 'หน่วยนับ'}</Label>
      <input type="hidden" name={name} value={value} />
      {custom ? (
        <div className="flex min-w-0 flex-col gap-2 sm:flex-row">
          <Input
            id={id}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            autoComplete="off"
            autoFocus
            required
          />
          <Button
            type="button"
            variant="outline"
            className="shrink-0"
            onClick={() => {
              setCustom(false);
              if (!normalizedOptions.includes(value.trim())) onChange('');
            }}
          >
            เลือกจากหน่วยที่มีอยู่
          </Button>
        </div>
      ) : (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              id={id}
              type="button"
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full min-w-0 justify-between font-normal"
            >
              <span className={cn('truncate', !value && 'text-muted-foreground')}>
                {value || 'เลือกหน่วยนับ'}
              </span>
              <ChevronsUpDown data-icon="inline-end" className="opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
            <Command>
              <CommandInput placeholder="ค้นหาหน่วยนับ" />
              <CommandList>
                <CommandEmpty>ไม่พบหน่วยนับที่ตรงกับคำค้น</CommandEmpty>
                <CommandGroup heading="หน่วยที่ใช้อยู่">
                  {normalizedOptions.map((option) => (
                    <CommandItem
                      key={option}
                      value={option}
                      onSelect={() => {
                        onChange(option);
                        setOpen(false);
                      }}
                    >
                      <Check className={cn(value === option ? 'opacity-100' : 'opacity-0')} />
                      {option}
                    </CommandItem>
                  ))}
                </CommandGroup>
                <CommandSeparator />
                <CommandGroup forceMount>
                  <CommandItem
                    value="ระบุหน่วยอื่น"
                    forceMount
                    onSelect={() => {
                      setCustom(true);
                      setOpen(false);
                      if (normalizedOptions.includes(value)) onChange('');
                    }}
                  >
                    <PencilLine />
                    ระบุหน่วยอื่น
                  </CommandItem>
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}
