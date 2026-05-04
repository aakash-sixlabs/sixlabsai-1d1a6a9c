// Mock competitor inference. Eventually replaced by a real Meta-derived inference call.
export interface InferredCompetitor {
  name: string;
  industry: string;
  website_url: string;
  logo_url: string;
}

const CIRKUL_COMPETITORS: InferredCompetitor[] = [
  {
    name: "Liquid I.V.",
    industry: "Hydration & Wellness",
    website_url: "https://www.liquid-iv.com/",
    logo_url: "https://logo.clearbit.com/liquid-iv.com",
  },
  {
    name: "Waterdrop",
    industry: "Hydration & Wellness",
    website_url: "https://www.waterdrop.com/",
    logo_url: "https://logo.clearbit.com/waterdrop.com",
  },
  {
    name: "Cure",
    industry: "Hydration & Wellness",
    website_url: "https://www.curehydration.com/",
    logo_url: "https://logo.clearbit.com/curehydration.com",
  },
  {
    name: "DripDrop",
    industry: "Hydration & Wellness",
    website_url: "https://dripdrop.com/",
    logo_url: "https://logo.clearbit.com/dripdrop.com",
  },
];

/** Pretend we inferred competitors from the brand's Meta ad profile. */
export async function inferCompetitorsMock(_brandHint?: string): Promise<InferredCompetitor[]> {
  await new Promise((r) => setTimeout(r, 1400));
  return CIRKUL_COMPETITORS;
}
