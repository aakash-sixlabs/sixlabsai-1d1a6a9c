

## Update Creative Goal Categories

Replace the 5 current goals with the new marketer-friendly categories and update the dynamic flow logic.

### New Categories

| Value | Label | Description | Example | Needs Product | Needs Promo |
|-------|-------|-------------|---------|---------------|-------------|
| `sale-promo` | Sale / Promotion | Run a sale, discount, or limited-time offer | "40% off sitewide this weekend" | No (optional) | Yes |
| `product-highlight` | Product Highlight | Showcase a product's value without a discount | "Meet the shoe built for marathon day" | Yes | No |
| `new-arrival` | New Arrival | Introduce a new product to your audience | "Just dropped: our lightweight summer jacket" | Yes | No |
| `brand-story` | Brand Story | Always-on creative that tells your brand's story | "Designed for athletes, by athletes" | No | No |
| `category-highlight` | Category Highlight | Spotlight an entire product category or collection | "Shop our bestselling skincare line" | No | No |

### Changes

**1. `CreateAdFlow.tsx`** — Update the `CreativeGoal` type union to the 5 new values. Update `GOAL_NEEDS_PRODUCT` to `["product-highlight", "new-arrival"]` and `GOAL_NEEDS_PROMO` to `["sale-promo"]`.

**2. `GoalStep.tsx`** — Replace the `GOALS` array with the 5 new categories, using appropriate icons (Tag, Sparkles, Rocket, Heart, LayoutGrid). Update headline to "What kind of ad do you want to create?" with subheadline "Pick the creative type — we'll tailor the flow and output to match."

**3. `ReviewStep.tsx`** — Verify it references goal values for display; update any label mappings to match new values.

