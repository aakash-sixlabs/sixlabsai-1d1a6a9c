import { useInView } from "./useInView";

export const Section = ({ children, className = "", id }: { children: React.ReactNode; className?: string; id?: string }) => {
  const { ref, visible } = useInView(0.08);
  return (
    <section
      ref={ref}
      id={id}
      className={`transition-all duration-700 ease-out ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"} ${className}`}
    >
      {children}
    </section>
  );
};
