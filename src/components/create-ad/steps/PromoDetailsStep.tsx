import { PromoDetails, OfferType } from "../CreateAdFlow";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, Percent, DollarSign, CalendarIcon, Gift, Repeat, Zap, PenLine, Tag, Sparkles, Check } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DisclaimerPicker } from "./DisclaimerPicker";

interface SavedOffer {
  id: string;
  name: string;
  offer_type: OfferType;
  discount_value: string | null;
  buy_qty: string | null;
  get_qty: string | null;
  trial_price: string | null;
  freebie_description: string | null;
  custom_offer_headline: string | null;
  promo_code: string | null;
  additional_notes: string | null;
}

const offerSummary = (o: SavedOffer): string => {
  switch (o.offer_type) {
    case "percentage": return `${o.discount_value}% off`;
    case "fixed": return `$${o.discount_value} off`;
    case "bogo": return `Buy ${o.buy_qty} Get ${o.get_qty} Free`;
    case "trial": return `Try for $${o.trial_price}`;
    case "freebie": return o.freebie_description ?? "";
    case "custom": return o.custom_offer_headline ?? "";
    default: return "";
  }
};

interface PromoDetailsStepProps {
  details: PromoDetails;
  onUpdate: (d: PromoDetails) => void;
  onNext: () => void;
  onBack: () => void;
}

const OFFER_TYPES: { type: OfferType; label: string; description: string; icon: React.ElementType }[] = [
  { type: "percentage", label: "Percentage Off", description: "e.g. 40% off everything", icon: Percent },
  { type: "fixed", label: "Fixed Amount Off", description: "e.g. $20 off your order", icon: DollarSign },
  { type: "bogo", label: "Buy X Get Y", description: "e.g. Buy 1 Get 1 Free", icon: Repeat },
  { type: "trial", label: "Trial / Intro Price", description: "e.g. Try for $1", icon: Zap },
  { type: "freebie", label: "Free Gift / Bonus", description: "e.g. Free shipping, gift", icon: Gift },
  { type: "custom", label: "Other", description: "Describe your own offer", icon: PenLine },
];

const isValid = (details: PromoDetails): boolean => {
  switch (details.offerType) {
    case "percentage":
    case "fixed":
      return !!details.discountValue.trim();
    case "bogo":
      return !!details.buyQty.trim() && !!details.getQty.trim();
    case "trial":
      return !!details.trialPrice.trim();
    case "freebie":
      return !!details.freebieDescription.trim();
    case "custom":
      return !!details.customOfferHeadline.trim();
    default:
      return false;
  }
};

export const PromoDetailsStep = ({ details, onUpdate, onNext, onBack }: PromoDetailsStepProps) => {
  const set = (partial: Partial<PromoDetails>) => onUpdate({ ...details, ...partial });

  const [startDate, setStartDate] = useState<Date | undefined>(
    details.startDate ? new Date(details.startDate) : undefined
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    details.endDate ? new Date(details.endDate) : undefined
  );

  const handleStartDate = (date: Date | undefined) => {
    setStartDate(date);
    set({ startDate: date?.toISOString() ?? "" });
  };

  const handleEndDate = (date: Date | undefined) => {
    setEndDate(date);
    set({ endDate: date?.toISOString() ?? "" });
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-foreground mb-1">Promotion details</h2>
      <p className="text-muted-foreground mb-8">
        What kind of offer are you running?
      </p>

      <div className="space-y-8">
        {/* Offer Type Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {OFFER_TYPES.map(({ type, label, description, icon: Icon }) => (
            <button
              key={type}
              onClick={() => set({ offerType: type })}
              className={cn(
                "flex flex-col items-start gap-2 p-4 rounded-lg border-2 transition-all text-left",
                details.offerType === type
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/40 bg-card"
              )}
            >
              <Icon className={cn("w-5 h-5", details.offerType === type ? "text-primary" : "text-muted-foreground")} />
              <div>
                <p className="font-medium text-foreground text-sm">{label}</p>
                <p className="text-xs text-muted-foreground">{description}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Conditional Fields */}
        {details.offerType && (
          <div className="space-y-6">
            {/* Percentage / Fixed */}
            {(details.offerType === "percentage" || details.offerType === "fixed") && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Discount Value
                </label>
                <div className="relative max-w-xs">
                  <span className="absolute left-3 top-2.5 text-muted-foreground text-sm">
                    {details.offerType === "percentage" ? "%" : "$"}
                  </span>
                  <Input
                    placeholder={details.offerType === "percentage" ? "40" : "20"}
                    value={details.discountValue}
                    onChange={(e) => set({ discountValue: e.target.value })}
                    className="pl-8"
                  />
                </div>
              </div>
            )}

            {/* BOGO */}
            {details.offerType === "bogo" && (
              <div className="space-y-4">
                <div className="flex items-end gap-3 max-w-md">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-foreground mb-2">Buy</label>
                    <Input
                      type="number"
                      min="1"
                      value={details.buyQty}
                      onChange={(e) => set({ buyQty: e.target.value })}
                      placeholder="1"
                    />
                  </div>
                  <span className="pb-2.5 text-muted-foreground font-medium">Get</span>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-foreground mb-2">Quantity</label>
                    <Input
                      type="number"
                      min="1"
                      value={details.getQty}
                      onChange={(e) => set({ getQty: e.target.value })}
                      placeholder="1"
                    />
                  </div>
                  <span className="pb-2.5 text-muted-foreground font-medium">Free</span>
                </div>
              </div>
            )}

            {/* Trial */}
            {details.offerType === "trial" && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Trial Price</label>
                <div className="relative max-w-xs">
                  <span className="absolute left-3 top-2.5 text-muted-foreground text-sm">$</span>
                  <Input
                    placeholder="1"
                    value={details.trialPrice}
                    onChange={(e) => set({ trialPrice: e.target.value })}
                    className="pl-8"
                  />
                </div>
              </div>
            )}

            {/* Freebie */}
            {details.offerType === "freebie" && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">What's the freebie?</label>
                <Input
                  placeholder="e.g. Free shipping on all orders, Free tote bag with purchase"
                  value={details.freebieDescription}
                  onChange={(e) => set({ freebieDescription: e.target.value })}
                  className="max-w-lg"
                />
              </div>
            )}

            {/* Custom */}
            {details.offerType === "custom" && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Offer Headline</label>
                <Input
                  placeholder="e.g. Flat rate shipping $5, Members-only early access"
                  value={details.customOfferHeadline}
                  onChange={(e) => set({ customOfferHeadline: e.target.value })}
                  className="max-w-lg"
                />
              </div>
            )}

            {/* Promo Code */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Promo Code <span className="text-muted-foreground font-normal">(optional)</span>
              </label>
              <Input
                placeholder="e.g. SUMMER40"
                value={details.promoCode}
                onChange={(e) => set({ promoCode: e.target.value })}
                className="max-w-xs"
              />
            </div>

            {/* Promotion Duration */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Promotion Duration <span className="text-muted-foreground font-normal">(optional)</span>
              </label>
              <div className="flex items-center gap-3">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-[180px] justify-start text-left font-normal",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "MMM d, yyyy") : "Start date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={handleStartDate}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>

                <span className="text-muted-foreground text-sm">to</span>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-[180px] justify-start text-left font-normal",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "MMM d, yyyy") : "End date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={handleEndDate}
                      disabled={(date) => startDate ? date < startDate : false}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Additional Notes */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Additional Notes <span className="text-muted-foreground font-normal">(optional)</span>
              </label>
              <Textarea
                placeholder="Any extra details — minimum order, exclusions, terms..."
                value={details.additionalNotes}
                onChange={(e) => set({ additionalNotes: e.target.value })}
                rows={3}
              />
            </div>

            {/* Disclaimers */}
            <DisclaimerPicker
              selectedIds={details.disclaimerIds}
              onChange={(selected) =>
                set({
                  disclaimerIds: selected.map((d) => d.id),
                  disclaimers: selected,
                })
              }
            />
          </div>
        )}
      </div>

      <div className="mt-8 flex justify-between">
        <Button variant="ghost" size="lg" onClick={onBack} className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
        <Button size="lg" onClick={onNext} disabled={!isValid(details)} className="gap-2">
          Continue <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
