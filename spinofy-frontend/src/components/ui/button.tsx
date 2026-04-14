import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { twMerge } from "tailwind-merge";

export const buttonVariants = cva(
  // Base style
  "inline-flex cursor-pointer items-center justify-center gap-2 rounded-full font-medium transition-colors duration-200 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        // Primary (default)
        primary: "bg-primary-orange hover:bg-primary-orange/90 text-white",

        // Outline (border + transparent background)
        outline:
          "border border-primary-orange text-primary-orange bg-transparent hover:bg-primary-orange/10",

        // Secondary (neutral tone)
        secondary:
          "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700",

        // Link (text only)
        link: "text-primary-orange underline-offset-4 hover:underline bg-transparent px-0 py-0",

        // Danger (error)
        danger: "bg-dark-red hover:bg-dark-red/90 text-white",

        // Disabled
        disabled: "bg-body-grey text-body-grey cursor-not-allowed",
      },
      size: {
        xl: "px-6 py-4 text-base",
        lg: "px-6 py-3 text-base",
        md: "px-4 py-2 text-sm",
        sm: "px-3 py-2 text-sm",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, size, asChild = false, disabled, ...props },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        ref={ref}
        className={twMerge(buttonVariants({ variant, size }), className)}
        disabled={disabled || variant === "disabled"}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export default Button;
