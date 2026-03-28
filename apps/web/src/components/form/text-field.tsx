import type * as React from "react";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type {
  ControllerFieldState,
  ControllerRenderProps,
} from "react-hook-form";

type TextFieldProps = {
  label: string;
  placeholder?: string;
  helperText?: string;
  field: ControllerRenderProps<any, any>;
  fieldState: ControllerFieldState;
  required?: boolean;
} & React.ComponentProps<"input">;

export const TextField: React.FC<TextFieldProps> = ({
  label,
  placeholder,
  field,
  fieldState,
  helperText,
  required = false,
  ...rest
}) => {
  const isInvalid = fieldState.invalid;
  return (
    <Field
      invalid={isInvalid}
      touched={fieldState.isTouched}
      dirty={fieldState.isDirty}
    >
      <FieldLabel>
        {label}
        {required && <span className="text-destructive">*</span>}
      </FieldLabel>
      <Input {...field} {...rest} placeholder={placeholder} />
      {isInvalid && <FieldError>{fieldState.error?.message}</FieldError>}
      {helperText && <FieldDescription>{helperText}</FieldDescription>}
    </Field>
  );
};
