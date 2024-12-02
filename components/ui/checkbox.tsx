// Custom Checkbox Component
import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Check } from 'lucide-react';
import { DevelopmentCategory, DevelopmentPriority } from '@/types/development';

export function Checkbox({
  id,
  label,
  checked,
  onChange,
  disabled,
}: {
  id: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center space-x-2">
      <button
        type="button"
        role="checkbox"
        aria-checked={checked}
        id={id}
        onClick={() => onChange(!checked)}
        disabled={disabled}
        className={`h-4 w-4 rounded border ${
          checked
            ? 'bg-green-600 border-green-600'
            : 'border-slate-300 dark:border-slate-600'
        } ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
        } flex items-center justify-center transition-colors`}
      >
        {checked && <Check className="h-3 w-3 text-white" />}
      </button>
      <Label htmlFor={id} className={`text-sm ${disabled ? 'opacity-50' : ''}`}>
        {label}
      </Label>
    </div>
  );
}
