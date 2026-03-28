import type * as React from "react";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  ControllerFieldState,
  ControllerRenderProps,
} from "react-hook-form";

export type SelectOption = {
  label: string;
  value: string;
};

type SelectFieldProps = {
  label: string;
  placeholder?: string;
  helperText?: string;
  field: ControllerRenderProps<any, any>;
  fieldState: ControllerFieldState;
  options: SelectOption[];
} & React.ComponentProps<"textarea">;

export const SelectField: React.FC<SelectFieldProps> = ({
  label,
  placeholder,
  field,
  fieldState,
  helperText,
  options = [],
  ...rest
}) => {
  const isInvalid = fieldState.invalid;
  return (
    <Field
      invalid={isInvalid}
      touched={fieldState.isTouched}
      dirty={fieldState.isDirty}
    >
      <FieldLabel>{label}</FieldLabel>
      <Select
        name={field.name}
        value={field.value}
        onValueChange={field.onChange}
      >
        <SelectTrigger className="w-full" aria-invalid={fieldState.invalid}>
          <SelectValue placeholder={placeholder}>
            {options.find(o => o.value === field.value)?.label ?? placeholder}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {options.map(option => {
            return (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>

      {isInvalid && <FieldError>{fieldState.error?.message}</FieldError>}
      {helperText && <FieldDescription>{helperText}</FieldDescription>}
    </Field>
  );
};
