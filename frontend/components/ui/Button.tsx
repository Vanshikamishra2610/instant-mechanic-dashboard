import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
}

export function Button({ className, variant = "secondary", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed",
        variant === "primary" &&
          "bg-accent text-base-bg hover:bg-accent/90",
        variant === "secondary" &&
          "border border-base-border bg-base-surface2 text-base-text hover:bg-base-border",
        variant === "ghost" && "text-base-muted hover:text-base-text hover:bg-base-surface2",
        className
      )}
      {...props}
    />
  );
}
