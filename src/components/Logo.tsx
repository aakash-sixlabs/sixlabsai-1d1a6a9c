import logoDark from "@/assets/sixlabs-logo.png";
import logoLight from "@/assets/sixlabs-logo-light.png";

type LogoProps = {
  className?: string;
  /** Tailwind height class, e.g. "h-7" */
  heightClass?: string;
  /** "dark" = navy wordmark for light backgrounds, "light" = white for dark backgrounds */
  variant?: "dark" | "light";
};

export const Logo = ({ className = "", heightClass = "h-7", variant = "dark" }: LogoProps) => (
  <img
    src={variant === "light" ? logoLight : logoDark}
    alt="SixLabs"
    className={`${heightClass} w-auto select-none ${className}`}
    draggable={false}
  />
);

export default Logo;
