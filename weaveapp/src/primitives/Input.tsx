import { InputHTMLAttributes, forwardRef } from "react";
import { twMerge } from "tailwind-merge";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  className?: string;
}

export type Ref = HTMLInputElement;

const Input = forwardRef<Ref, InputProps>((props, ref) => {
  const { className, ...rest } = props;
  return (
    <input
      className={twMerge(
        "h-4 w-10 px-1 py-1 bg-transparent text-lg font-semibold text-bca-grey-9 focus:border-bca-success-6 focus:outline-none focus-visible:rounded-md focus-visible:shadow-bca-shadow-green  disabled:opacity-50",
        className
      )}
      ref={ref}
      {...rest}
      // role="presentation"
      autoComplete="off"
    />
  );
});

export { Input };
