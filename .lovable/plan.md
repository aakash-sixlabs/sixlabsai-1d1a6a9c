

## Plan: Run Meta data sync for Stealth_ad_account

This is an operational task — I'll invoke the `meta-sync` edge function with the Stealth_ad_account ID to pull campaigns, ads, creatives, and insights from Meta.

### What will happen
1. Call the `meta-sync` edge function with `adAccountId: "bd8a3b44-4a4c-4064-b2e1-1405afdf0f05"` and `dateRangeDays: "90"`
2. The function will pull campaigns, ad sets, ads, creatives (with image downloads), and performance insights from Meta's API
3. Data will be stored across the `campaigns`, `ad_sets`, `ads`, `ad_creatives`, and `ad_insights` tables
4. A `sync_jobs` record will track progress

### Requirements
- You must be logged in to the preview app (the edge function requires authentication)
- The Meta access token stored in `meta_connections` must still be valid

### Steps
1. Deploy the meta-sync edge function (ensure latest version is live)
2. Invoke it via `curl_edge_functions` with the Stealth_ad_account ID
3. Query the database to verify data was populated

