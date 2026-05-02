// Shared design tokens for the Create Ad flow steps.
// Keeping these centralized ensures every step looks like part of the same flow.

export const STEP_CONTAINER = "max-w-4xl mx-auto";

// Selectable card (used everywhere a user picks from a set of options)
export const CARD_BASE =
  "group relative text-left rounded-2xl border-2 transition-all duration-200";
export const CARD_SELECTED =
  "border-primary bg-primary/[0.03] shadow-md ring-1 ring-primary/20";
export const CARD_IDLE =
  "border-border/80 bg-card hover:border-primary/30 hover:shadow-sm";

// Primary CTA shape used by every Continue / Generate button
export const CTA_SHAPE = "gap-2 rounded-xl";

// Step heading + subtitle spacing
export const STEP_HEADING = "text-2xl font-bold text-foreground mb-1";
export const STEP_SUBTITLE = "text-muted-foreground mb-10";
