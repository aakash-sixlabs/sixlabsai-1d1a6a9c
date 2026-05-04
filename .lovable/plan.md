## Audit: what the create-ad flow collects vs what `generation_jobs` stores

The `CreateAdState` (client) currently collects:

- `goal` ✅ stored as `goal`
- `promoScope` ✅ stored as `promo_scope`
- `productImage` ✅ stored as `product_image_url`
- `productUrl` ✅ stored as `product_url`
- `productInputMethod` ✅ stored as `product_input_method`
- `aspectRatios` ✅ stored as `aspect_ratios`
- `promoDetails` (incl. offer fields, promo code, dates, notes, **disclaimerIds**, **disclaimers**) ✅ stored as `promo_details` jsonb — but disclaimers are buried inside this blob, not queryable
- `icpId` / `icpName` / `icpDescription` ❌ **NOT stored anywhere** (lost after generation)
- `adAccountId` ✅ stored as `ad_account_id`

The full payload is also dumped into `service_request_payload` jsonb, so technically nothing is *lost* — but the things we'll likely want to query, filter, or report on (which ICP an ad targets, which disclaimers were attached) deserve first-class columns.

## What's missing / worth adding

Add three first-class fields to `generation_jobs`:

1. **`icp_id` (uuid, nullable)** — references the chosen ICP. Lets us answer "show all creatives generated for ICP X" without scanning JSON.
2. **`icp_snapshot` (jsonb, nullable)** — `{ name, description }` captured at generation time. Preserves intent even if the ICP is later edited or deleted.
3. **`disclaimer_ids` (uuid[], nullable)** — array of disclaimer IDs used. Easy to join/filter. The full label+text snapshot stays inside `promo_details.disclaimers` for historical fidelity.

Everything else in the flow is already covered by existing columns or the `service_request_payload` snapshot.

## Implementation

### 1. Migration
Add columns to `generation_jobs`:
```text
icp_id          uuid       null
icp_snapshot    jsonb      null
disclaimer_ids  uuid[]     null  default '{}'
```
No FK constraints (matches the table's existing convention of no FKs); nullable so existing rows stay valid.

### 2. `supabase/functions/generate-creatives/index.ts`
- Extend the `CreateAdState` interface with `icpId`, `icpName`, `icpDescription`, and `promoDetails.disclaimerIds` / `promoDetails.disclaimers`.
- On insert into `generation_jobs`, populate the three new columns from the payload.

### 3. `src/components/create-ad/steps/GeneratingStep.tsx`
No change needed — it already spreads the entire `state` into the edge function body, so `icpId` / `icpName` / `icpDescription` will flow through automatically.

### 4. `src/integrations/supabase/types.ts`
Auto-regenerated after migration. No manual edit.

## Out of scope
- No UI changes.
- No backfill of historical jobs (they keep `null` for the new columns).
- Disclaimer label/text is intentionally left inside `promo_details` rather than duplicated into a snapshot column — `disclaimers` table rows aren't typically deleted, and the JSON snapshot is sufficient.