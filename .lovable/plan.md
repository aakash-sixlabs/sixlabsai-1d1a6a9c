

## Problem

The current Promotion Details step only supports two offer types: "Percentage Off" and "Fixed Amount Off". Real-world promotions are far more diverse -- BOGO, "Try for $1", free shipping, bundle deals, gift-with-purchase, etc. The rigid two-option model can't represent these.

## Solution: Offer Type Selector with Conditional Fields

Replace the binary discount type picker with a broader set of **offer types**, each showing only the fields relevant to that type. This keeps the UI clean while covering the full range of real promotions.

### Offer Types

| Type | Label | Example | Fields shown |
|------|-------|---------|-------------|
| `percentage` | Percentage Off | 40% off | Discount value (%) |
| `fixed` | Fixed Amount Off | $20 off | Discount value ($) |
| `bogo` | Buy X Get Y | Buy 1 Get 1 Free | Buy quantity, Get quantity, Get discount (free / % off) |
| `trial` | Trial / Introductory | Try for $1 | Trial price |
| `freebie` | Free Gift / Bonus | Free shipping, gift with purchase | Description of the freebie |
| `custom` | Other | Any offer not above | Free-text offer headline |

### UI Layout

Cards in a 3-column grid (similar to the goal step), each with an icon and short description. Selecting one reveals only the relevant input fields below.

### Data Model Changes

**`CreateAdFlow.tsx`** -- update `PromoDetails` interface:

```typescript
export type OfferType = "percentage" | "fixed" | "bogo" | "trial" | "freebie" | "custom";

export interface PromoDetails {
  offerType: OfferType;
  // percentage / fixed
  discountValue: string;
  // bogo
  buyQty: string;
  getQty: string;
  bogoDiscount: string; // "free" | percentage string
  // trial
  trialPrice: string;
  // freebie
  freebieDescription: string;
  // custom
  customOfferHeadline: string;
  // shared
  promoCode: string;
  startDate: string;
  endDate: string;
  additionalNotes: string;
}
```

### Files to Change

1. **`src/components/create-ad/CreateAdFlow.tsx`** -- Update `PromoDetails` type and initial state
2. **`src/components/create-ad/steps/PromoDetailsStep.tsx`** -- Replace discount type picker with 6-option offer type grid; conditionally render relevant fields per type; update continue-button validation
3. **`src/components/create-ad/steps/ReviewStep.tsx`** -- Update summary display to render the offer correctly based on `offerType`

