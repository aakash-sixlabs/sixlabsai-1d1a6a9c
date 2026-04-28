import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Section } from "./Section";

export const CTASection = () => {
  const navigate = useNavigate();
  return (
    <Section className="px-6 py-20">
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="font-display font-bold text-3xl md:text-4xl text-foreground">
          Stop guessing.{" "}
          <span className="bg-gradient-to-r from-primary to-[hsl(260_70%_58%)] bg-clip-text text-transparent">
            Start compounding.
          </span>
        </h2>
        <p className="mt-4 text-muted-foreground max-w-md mx-auto font-body">
          Let your ads learn and improve themselves. Every campaign gets smarter.
        </p>
        <Button
          size="lg"
          className="mt-8 font-semibold rounded-xl px-10 h-12 text-[15px] gap-2 shadow-lg shadow-primary/30"
          onClick={() => navigate("/loginvcollect")}
        >
          Create Your Next Winning Ad <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </Section>
  );
};
