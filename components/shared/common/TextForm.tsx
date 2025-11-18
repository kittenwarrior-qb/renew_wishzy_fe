import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type TextFieldConfig = {
  name: string;
  label?: string;
  placeholder?: string;
  defaultValue?: string;
  disabled?: boolean;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  validate?: (value: string, values: Record<string, string>) => string | undefined;
  format?: (value: string, values: Record<string, string>) => string;
  colSpanMd?: number;
};
export type TextFormProps = {
  fields: TextFieldConfig[];
  initialValues?: Record<string, string>;
  onSubmit?: (values: Record<string, string>) => void | Promise<void>;
  onChange?: (values: Record<string, string>) => void;
  submitLabel?: string;
  className?: string;
  fieldClassName?: string;
  renderSubmit?: (ctx: { submitting: boolean; valid: boolean }) => React.ReactNode;
  autoFocusFirst?: boolean;
};

export default function TextForm({
  fields,
  initialValues,
  onSubmit,
  onChange,
  submitLabel,
  className,
  fieldClassName,
  renderSubmit,
  autoFocusFirst = true,
}: TextFormProps) {
  // Generate initial state
  const initial = useMemo(() => {
    const obj: Record<string, string> = {};
    for (const f of fields) {
      obj[f.name] = initialValues?.[f.name] ?? f.defaultValue ?? "";
    }
    return obj;
  }, [fields, initialValues]);

  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);

  // Validate 1 field
  const validateField = useCallback(
    (name: string, value: string, allValues: Record<string, string>) => {
      const cfg = fields.find((f) => f.name === name);
      const err = cfg?.validate ? cfg.validate(value, allValues) : undefined;
      setErrors((prev) => ({ ...prev, [name]: err }));
      return err;
    },
    [fields]
  );

  // Validate entire form
  const validateAll = useCallback(
    (vals: Record<string, string>) => {
      const next: Record<string, string | undefined> = {};
      for (const f of fields) {
        next[f.name] = f.validate ? f.validate(vals[f.name] ?? "", vals) : undefined;
      }
      setErrors(next);
      return next;
    },
    [fields]
  );

  // Change handler
  const handleChange = useCallback(
    (name: string, raw: string) => {
      setValues((prev) => {
        let next = { ...prev, [name]: raw };

        const cfg = fields.find((f) => f.name === name);
        if (cfg?.format) {
          const formatted = cfg.format(raw, next);
          next = { ...next, [name]: formatted };
        }

        validateField(name, next[name], next);
        return next;
      });
    },
    [fields, validateField]
  );

  const handleBlur = useCallback(
    (name: string) => {
      setTouched((t) => ({ ...t, [name]: true }));
      validateField(name, values[name] ?? "", values);
    },
    [values, validateField]
  );

  const hasErrors = useMemo(() => Object.values(errors).some(Boolean), [errors]);

  // 🔥 FIX CHÍNH: chỉ depend values, KHÔNG depend onChange
  useEffect(() => {
    if (onChange) onChange(values);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      const allTouched: Record<string, boolean> = {};
      for (const f of fields) allTouched[f.name] = true;
      setTouched(allTouched);

      const errs = validateAll(values);
      if (Object.values(errs).some(Boolean)) return;

      if (!onSubmit) return;
      try {
        setSubmitting(true);
        await onSubmit(values);
      } finally {
        setSubmitting(false);
      }
    },
    [fields, values, validateAll, onSubmit]
  );

  return (
    <form onSubmit={handleSubmit} className={className}>
      <div className={className ? undefined : "grid grid-cols-1 md:grid-cols-12 gap-2"}>
        {fields.map((f, idx) => {
          const value = values[f.name] ?? "";
          const error = touched[f.name] ? errors[f.name] : undefined;

          const colMap: Record<number, string> = {
            1: "md:col-span-1",
            2: "md:col-span-2",
            3: "md:col-span-3",
            4: "md:col-span-4",
            5: "md:col-span-5",
            6: "md:col-span-6",
            7: "md:col-span-7",
            8: "md:col-span-8",
            9: "md:col-span-9",
            10: "md:col-span-10",
            11: "md:col-span-11",
            12: "md:col-span-12",
          };

          const colCls = colMap[f.colSpanMd ?? 6];

          return (
            <div key={f.name} className={`${fieldClassName ?? ""} ${colCls}`}>
              {f.label && <Label htmlFor={f.name}>{f.label}</Label>}

              <Input
                id={f.name}
                name={f.name}
                value={value}
                placeholder={f.placeholder}
                disabled={f.disabled}
                autoFocus={autoFocusFirst && idx === 0 && !f.disabled}
                onChange={(e) => handleChange(f.name, e.target.value)}
                onBlur={() => handleBlur(f.name)}
                className={`${f.inputProps?.className ?? ""} h-9`}
                {...f.inputProps}
              />

              <p className={`mt-1 text-xs min-h-4 leading-4 ${error ? "text-destructive" : "text-transparent"}`}>
                {error || "\u00A0"}
              </p>
            </div>
          );
        })}
      </div>

      {renderSubmit ? (
        renderSubmit({ submitting, valid: !hasErrors })
      ) : onSubmit ? (
        <button
          type="submit"
          disabled={submitting || hasErrors}
          className="mt-3 inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {submitLabel ?? "Submit"}
        </button>
      ) : null}
    </form>
  );
}
