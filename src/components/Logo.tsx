import logo from "@/assets/sixlabs-logo.png";

type LogoProps = {
  className?: string;
  /** Tailwind height class, e.g. "h-7" */
  heightClass?: string;
};

export const Logo = ({ className = "", heightClass = "h-7" }: LogoProps) => (
  <img
    src={logo}
    alt="SixLabs"
    className={`${heightClass} w-auto select-none ${className}`}
    draggable={false}
  />
);

export default Logo;
