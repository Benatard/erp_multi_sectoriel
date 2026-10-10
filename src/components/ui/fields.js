import React from 'react';

const baseInput =
  'w-full border border-stroke bg-gray2 px-3.5 py-2.5 text-sm text-dark outline-none transition-all duration-300 focus:border-primary focus:ring-4 focus:ring-primary/15 dark:border-transparent dark:bg-[#2C303B] dark:text-body-dark';

function Field({ label, required, children }) {
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

export function TextField({ label, required, ...props }) {
  return (
    <Field label={label} required={required}>
      <input className={baseInput} {...props} />
    </Field>
  );
}

export function TextareaField({ label, required, rows = 3, ...props }) {
  return (
    <Field label={label} required={required}>
      <textarea className={`${baseInput} resize-y`} rows={rows} {...props} />
    </Field>
  );
}

export function SelectField({ label, required, options = [], placeholder, ...props }) {
  return (
    <Field label={label} required={required}>
      <select className={baseInput} {...props}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </Field>
  );
}

export function NumberField({ label, required, ...props }) {
  return (
    <Field label={label} required={required}>
      <input className={baseInput} type="number" step="any" {...props} />
    </Field>
  );
}

export function DateField({ label, required, ...props }) {
  return (
    <Field label={label} required={required}>
      <input className={baseInput} type="date" {...props} />
    </Field>
  );
}

export default Field;