import * as React from "react";
import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        //Base Style
        "w-full h-[60px] min-w-0 px-6 py-4 text-base rounded-[16px] border border-gray-200 shadow-sm outline-none transition-all duration-200 bg-body-grey/5 font-medium placeholder:font-medium",

        //Placeholder & Disabled States
        "placeholder:text-gray-400 disabled:cursor-not-allowed disabled:opacity-50",

        //Focus & Active States
        "focus:border-primary-orange focus:ring-2 focus:ring-primary-orange/20",

        //File Input & Selection
        "file:text-foreground file:bg-transparent file:border-0 file:font-medium file:text-sm",

        // Accessibility (invalid, etc.)
        "aria-invalid:border-red-500 aria-invalid:ring-red-100",

        className
      )}
      {...props}
    />
  );
}

export { Input };
