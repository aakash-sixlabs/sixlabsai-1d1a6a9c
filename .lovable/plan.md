

## Plan: Visual Card-Based Goal Selection

Replace the current vertical list of goal tiles with a horizontal grid of visual cards (like the Meta Ads Manager format picker in the reference image). Each card will feature an SVG illustration depicting the ad type, making it instantly recognizable.

### Layout Change
- Switch from `space-y-3` vertical stack to a responsive horizontal grid (`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4`)
- Each card becomes a vertical card: illustration on top, label + short description below
- Selected state: blue border + checkmark circle in top-left corner (matching reference)
- Remove the `example` italic text to keep cards compact

### SVG Illustrations (inline, no external assets)
Each goal gets a purpose-built inline SVG illustration rendered directly in the component:

1. **Sale / Promotion** — A price tag with a percent symbol and bold banner/burst shape
2. **Product Highlight** — A single product card/frame with a spotlight effect
3. **New Arrival** — A product box with a "NEW" badge/ribbon
4. **Brand Story** — A collage/mood-board style frame with overlapping image placeholders
5. **Category Highlight** — A grid of multiple product thumbnails (like a collection)

The SVGs will use muted grays for unselected state and primary blue accents for selected state, similar to Meta's approach in the reference.

### Technical Details
- **File changed**: `src/components/create-ad/steps/GoalStep.tsx` — full rewrite of the card layout and addition of inline SVG illustration components
- No new files or dependencies needed
- The card dimensions and illustration style will be consistent across all 5 options

