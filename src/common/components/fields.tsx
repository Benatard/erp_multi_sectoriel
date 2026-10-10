import type { ReactNode } from 'react';
import type { Option } from '../types';

const baseInput =
  'w-full border border-stroke bg-gray2 px-3.5 py-2.5 text-sm text-dark outline-none transition-all duration-300 focus:border-primary focus:ring-4 focus:ring-primary/15 dark:border-transparent dark:bg-[#2C303B] dark:text-body-dark';

interface FieldProps {
  label?: string;
  required?: boolean;
  children?: ReactNode;
}

function Field({ label, required, children }: FieldProps) {
  return (
    <label className="block">
      {label && (
        <span className="label-root mb-1.5">
          {label} {required && <span className="text-red-500">*</span>}
        </span>
      )}
      {children}
    </label>
  );
}

type InputFieldProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'children'> & {
  label?: string;
  required?: boolean;
};

export function TextField({ label, required, ...props }: InputFieldProps) {
  return (
    <Field label={label} required={required}>
      <input className={baseInput} {...props} />
    </Field>
  );
}

export function TextareaField({ label, required, rows = 3, ...props }: Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'children'> & FieldProps) {
  return (
    <Field label={label} required={required}>
      <textarea className={`${baseInput} resize-y`} rows={rows} {...props} />
    </Field>
  );
}

type SelectFieldProps = Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'children' | 'placeholder'> &
  FieldProps & { options?: Option[]; placeholder?: string };

export function SelectField({ label, required, options = [], placeholder, ...props }: SelectFieldProps) {
  return (
    <Field label={label} required={required}>
      <select className={baseInput} {...props}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={String(opt.value)} value={String(opt.value)}>
            {opt.label}
          </option>
        ))}
      </select>
    </Field>
  );
}

export function NumberField({ label, required, ...props }: InputFieldProps) {
  return (
    <Field label={label} required={required}>
      <input className={baseInput} type="number" step="any" {...props} />
    </Field>
  );
}

export function DateField({ label, required, ...props }: InputFieldProps) {
  return (
    <Field label={label} required={required}>
      <input className={baseInput} type="date" {...props} />
    </Field>
  );
}

export default Field;