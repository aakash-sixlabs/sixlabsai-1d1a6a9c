

# Rebuild Landing Page as First-Time Onboarding Welcome

## Problem
The previous plan assumed a returning user ("Welcome back"). This is actually the **first screen a new user sees after signing up**. It should onboard them, explain the product value quickly, and guide them to their first action.

## Design Direction
A clean, focused onboarding welcome — like Loom's first-login screen or Linear's onboarding. Warm greeting, quick value explanation, and a single clear path forward. No dashboard stats (they have none yet).

## Layout

```text
┌──────────────────────────────────────────────────┐
│  Header (logo)                                   │
├──────────────────────────────────────────────────┤
│                                                  │
│          ✨ Welcome to CreativeGen               │
│   Generate Meta ad creatives informed by your    │
│   actual ad performance data.                    │
│                                                  │
│   ┌─────────────────────────────────────────┐    │
│   │  🚀 Let's create your first ad          │    │
│   │  We'll walk you through 4 simple steps  │    │
│   │           [ Get Started → ]             │    │
│   └─────────────────────────────────────────┘    │
│                                                  │
│   Here's how it works                            │
│   ① Connect Meta ─→ ② Analyze ─→               │
│   ③ Add Product  ─→ ④ Generate                  │
│                                                  │
│   ┌──────────┐ ┌──────────┐ ┌──────────┐        │
│   │ Data-    │ │ Shopify  │ │ Copy +   │        │
│   │ driven   │ │ product  │ │ rationale│        │
│   └──────────┘ └──────────┘ └──────────┘        │
│          3 compact value props                   │
└──────────────────────────────────────────────────┘
```

## Changes

### 1. Rebuild `LandingStep.tsx`
Replace all marketing content with an onboarding-first layout:
- **Welcome heading**: "Welcome to CreativeGen" with a sparkle icon — subtitle explaining the product in one sentence
- **Primary CTA card**: Prominent card with "Let's create your first ad" — subtitle "We'll guide you through connecting your Meta account, analyzing performance, and generating creatives" — single "Get Started" button calling `setStep("meta-connect")`
- **How It Works stepper**: 4 steps shown as a horizontal numbered timeline (Connect Meta → Analyze Performance → Add Product → Generate Creatives) — compact, visual
- **3 value prop pills**: Small cards below — "Data-driven creatives", "Shopify product extraction", "Copy + rationale included" — brief, not marketing-heavy
- Remove: hero image import, features array, "See How It Works" button, checkmark list, two-column grid layout

### 2. Minor update to `WizardShell.tsx`
- On the landing step, keep header minimal (logo only, no stepper — already the case)
- No user avatar needed yet (this is first login, keep it simple)

### 3. No new files
All changes in `LandingStep.tsx`. Reuse `Card`, `Button` from existing UI components.

