import { PromoDetails } from "../CreateAdFlow";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ArrowLeft, ArrowRight, Percent, DollarSign, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface PromoDetailsStepProps {
  details: PromoDetails;
  onUpdate: (d: PromoDetails) => void;
  onNext: () => void;
  onBack: () => void;
}

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
        Tell us about your offer so we can craft the right message.
      </p>

      <div className="space-y-6">
        {/* Discount Type */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Discount Type</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => set({ discountType: "percentage" })}
              className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                details.discountType === "percentage"
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/40 bg-card"
              }`}
            >
              <Percent className={`w-5 h-5 ${details.discountType === "percentage" ? "text-primary" : "text-muted-foreground"}`} />
              <div className="text-left">
                <p className="font-medium text-foreground text-sm">Percentage Off</p>
                <p className="text-xs text-muted-foreground">e.g. 40% off</p>
              </div>
            </button>
            <button
              onClick={() => set({ discountType: "fixed" })}
              className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                details.discountType === "fixed"
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/40 bg-card"
              }`}
            >
              <DollarSign className={`w-5 h-5 ${details.discountType === "fixed" ? "text-primary" : "text-muted-foreground"}`} />
              <div className="text-left">
                <p className="font-medium text-foreground text-sm">Fixed Amount</p>
                <p className="text-xs text-muted-foreground">e.g. $20 off</p>
              </div>
            </button>
          </div>
        </div>

        {/* Discount Value */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Discount Value
          </label>
          <div className="relative max-w-xs">
            <span className="absolute left-3 top-2.5 text-muted-foreground text-sm">
              {details.discountType === "percentage" ? "%" : "$"}
            </span>
            <Input
              placeholder={details.discountType === "percentage" ? "40" : "20"}
              value={details.discountValue}
              onChange={(e) => set({ discountValue: e.target.value })}
              className="pl-8"
            />
          </div>
        </div>

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

        {/* Promotion Duration - Date Range */}
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
            placeholder="Any extra details — free shipping, minimum order, exclusions..."
            value={details.additionalNotes}
            onChange={(e) => set({ additionalNotes: e.target.value })}
            rows={3}
          />
        </div>
      </div>

      <div className="mt-8 flex justify-between">
        <Button variant="ghost" size="lg" onClick={onBack} className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
        <Button size="lg" onClick={onNext} disabled={!details.discountValue.trim()} className="gap-2">
          Continue <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
