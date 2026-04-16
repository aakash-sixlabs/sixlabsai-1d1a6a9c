import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>

        <article className="prose prose-sm max-w-none">
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">Privacy Policy</h1>
          <p className="text-sm text-muted-foreground mb-8">
            Six Labs AI Inc. · Effective date: April 8, 2026 · Last updated: April 8, 2026
          </p>

          <div className="space-y-6 text-sm text-foreground leading-relaxed">
            <p>
              Six Labs AI Inc. ("Six Labs", "we", "us", or "our") operates an AI-powered advertising
              creative optimization platform accessible at <strong>sixlabs.ai</strong> (the "Platform").
              This Privacy Policy explains how we collect, use, disclose, and protect information when
              you use our Platform.
            </p>
            <p>
              By accessing or using the Platform, you agree to the practices described in this policy.
              If you do not agree, please do not use the Platform.
            </p>
            <p className="bg-secondary/50 border-l-2 border-primary pl-4 py-3 rounded-r">
              <strong>Summary for Meta App Review:</strong> Six Labs is a B2B SaaS platform. We connect
              to Meta Marketing API on behalf of business clients (advertisers) to read their ad
              campaign performance data and publish new ad creatives. We do not collect, store, or
              process personal data about end consumers (the people who see ads). All data we handle
              belongs to business clients who have explicitly authorized our access.
            </p>

            <Section title="1. Who We Are">
              <p>
                Six Labs AI Inc. is a corporation incorporated in Delaware, USA, operating primarily in
                Canada. We provide an AI-powered platform that helps e-commerce brands optimize their
                paid advertising creative on Meta (Facebook and Instagram) and other digital
                advertising channels.
              </p>
              <p>
                Our platform connects to third-party services — including Meta Ads Manager, Shopify,
                and Foreplay — on behalf of our business clients to retrieve advertising data, generate
                new creative variants, and publish approved creatives back to advertising platforms.
              </p>
            </Section>

            <Section title="2. Scope of This Policy">
              <p>This policy applies to:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Individuals who register for and use the Six Labs platform as business clients ("Clients")</li>
                <li>Authorized users within a Client organization who access the platform</li>
                <li>Visitors to sixlabs.ai</li>
              </ul>
              <p>
                This policy does <strong>not</strong> apply to end consumers — the individuals who see
                advertisements served by our Clients. Six Labs does not collect, receive, or process
                any personal data about advertising audiences or consumers.
              </p>
            </Section>

            <Section title="3. Information We Collect">
              <h3 className="font-semibold mt-4">3.1 Account and Registration Information</h3>
              <p>When you create an account or onboard as a Client, we collect:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Name, email address, and company name</li>
                <li>Billing information (processed by our payment provider — we do not store raw card data)</li>
                <li>Communications you send us</li>
              </ul>

              <h3 className="font-semibold mt-4">3.2 Business and Advertising Data</h3>
              <p>When you connect your advertising accounts to our Platform, we access and store:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>Meta Ads data:</strong> Campaign structures, ad sets, ad names, ad creative
                  assets (images and videos), and performance metrics (impressions, clicks, spend, CTR,
                  frequency, ROAS). This data is retrieved via the Meta Marketing API using access
                  tokens you explicitly authorize.
                </li>
                <li>
                  <strong>Shopify product data:</strong> Product titles, descriptions, and product
                  image URLs retrieved from your Shopify store via the Shopify Storefront API when you
                  provide a product page URL.
                </li>
                <li>
                  <strong>Competitor advertising data:</strong> Publicly available competitor ad
                  information retrieved from Foreplay's database on your behalf, used solely to inform
                  creative optimization recommendations for your account.
                </li>
              </ul>
              <p>
                All advertising data we collect is <strong>business data</strong> belonging to your
                organization. It does not include personal data about individual consumers, audience
                targeting lists, or any data that identifies end users of your ads.
              </p>

              <h3 className="font-semibold mt-4">3.3 Usage and Technical Data</h3>
              <p>We automatically collect certain technical information when you use the Platform:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Log data including IP address, browser type, pages visited, and timestamps</li>
                <li>Device information</li>
                <li>Cookies and similar tracking technologies (see Section 8)</li>
              </ul>
            </Section>

            <Section title="4. How We Use Your Information">
              <p>We use the information we collect to:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>Provide the Platform:</strong> Analyze your ad performance, detect creative fatigue, generate replacement ad creative variants, and publish approved creatives to your Meta ad account</li>
                <li><strong>Improve our services:</strong> Develop and improve our AI models and platform features using aggregated, de-identified performance data</li>
                <li><strong>Communicate with you:</strong> Send service notifications, product updates, and respond to your support requests</li>
                <li><strong>Billing and account management:</strong> Process payments and manage your subscription</li>
                <li><strong>Legal compliance:</strong> Meet our legal obligations under applicable law</li>
              </ul>
              <p>We do <strong>not</strong>:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Sell your data to third parties</li>
                <li>Use your advertising data to serve ads to your audiences on your behalf outside of your explicit instructions</li>
                <li>Share your individual campaign performance data with other Clients</li>
                <li>Use your data for any purpose beyond operating and improving the Platform</li>
              </ul>
            </Section>

            <Section title="5. Meta Platform Data">
              <p>
                Our use of data obtained through the Meta Marketing API is subject to Meta's Platform
                Terms and Developer Policies. Specifically:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>We access Meta data only after receiving explicit authorization from the account holder via Meta's OAuth flow</li>
                <li>We use Meta data solely to provide advertising optimization services to the authorizing Client</li>
                <li>We store Meta access tokens securely and do not share them with third parties</li>
                <li>We do not use Meta data to build profiles of individual consumers or track individuals across websites</li>
                <li>Clients may revoke our access to their Meta account at any time through Meta's settings or by contacting us</li>
                <li>Upon revocation or account termination, we delete associated Meta access tokens within 30 days</li>
              </ul>
              <p>
                Our application requests the following Meta permissions:{" "}
                <code className="bg-secondary px-1.5 py-0.5 rounded text-xs">ads_read</code>,{" "}
                <code className="bg-secondary px-1.5 py-0.5 rounded text-xs">business_management</code>, and{" "}
                <code className="bg-secondary px-1.5 py-0.5 rounded text-xs">email</code>. These are used
                exclusively to read campaign performance data and manage advertising assets on behalf of
                authorized Clients.
              </p>
            </Section>

            <Section title="6. How We Share Information">
              <p>
                We do not sell, rent, or trade your information. We share information only in the
                following limited circumstances:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>Service providers:</strong> We use trusted third-party providers to operate the Platform, including cloud hosting (Supabase for database), payment processing, and AI model providers. These providers are contractually bound to protect your data and use it only to provide services to us.</li>
                <li><strong>Legal requirements:</strong> We may disclose information if required by law, court order, or to protect the rights, property, or safety of Six Labs, our Clients, or others.</li>
                <li><strong>Business transfers:</strong> In the event of a merger, acquisition, or sale of assets, your information may be transferred. We will notify you before your information becomes subject to a different privacy policy.</li>
              </ul>
            </Section>

            <Section title="7. Data Retention">
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>Account data:</strong> Retained for the duration of your subscription and deleted within 90 days of account termination upon request</li>
                <li><strong>Ad performance data:</strong> Retained for up to 24 months to support trend analysis and model improvement, then deleted or anonymized</li>
                <li><strong>Meta access tokens:</strong> Deleted within 30 days of account termination or access revocation</li>
                <li><strong>Backup data:</strong> May be retained in encrypted backups for up to 90 days beyond the above periods</li>
              </ul>
            </Section>

            <Section title="8. Cookies">
              <p>We use cookies and similar technologies to:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Keep you logged in to the Platform</li>
                <li>Understand how you use the Platform (analytics)</li>
                <li>Remember your preferences</li>
              </ul>
              <p>
                You can control cookies through your browser settings. Disabling cookies may affect
                your ability to use certain features of the Platform.
              </p>
            </Section>

            <Section title="9. Data Security">
              <p>We implement industry-standard security measures to protect your information, including:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Encryption of data in transit (TLS) and at rest</li>
                <li>Access controls limiting who within Six Labs can access client data</li>
                <li>Secure storage of API credentials and access tokens</li>
                <li>Regular security reviews</li>
              </ul>
              <p>
                No system is completely secure. In the event of a data breach that affects your
                information, we will notify you as required by applicable law.
              </p>
            </Section>

            <Section title="10. Your Rights">
              <p>Depending on your location, you may have the following rights regarding your information:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>Access:</strong> Request a copy of the information we hold about you</li>
                <li><strong>Correction:</strong> Request correction of inaccurate information</li>
                <li><strong>Deletion:</strong> Request deletion of your information, subject to legal retention requirements</li>
                <li><strong>Portability:</strong> Request your data in a structured, machine-readable format</li>
                <li><strong>Withdrawal of consent:</strong> Revoke access to your Meta account or other connected platforms at any time</li>
              </ul>
              <p>
                To exercise any of these rights, contact us at the address below. We will respond
                within 30 days.
              </p>
            </Section>

            <Section title="11. International Data Transfers">
              <p>
                Six Labs is based in Canada and serves clients in Canada and the United States. Your
                data may be processed and stored on servers located in the United States. By using the
                Platform, you consent to the transfer of your information to the United States and any
                other country where our service providers operate, subject to appropriate safeguards.
              </p>
            </Section>

            <Section title="12. Children's Privacy">
              <p>
                The Platform is designed for use by businesses and is not directed at individuals under
                the age of 18. We do not knowingly collect personal information from minors. If you
                believe a minor has provided us with personal information, please contact us and we
                will delete it.
              </p>
            </Section>

            <Section title="13. Changes to This Policy">
              <p>
                We may update this Privacy Policy from time to time. When we make material changes, we
                will notify you by email or by posting a prominent notice on the Platform. The "Last
                updated" date at the top of this policy reflects the most recent revision. Your
                continued use of the Platform after any changes constitutes your acceptance of the
                updated policy.
              </p>
            </Section>

            <Section title="14. Contact Us">
              <p>
                If you have questions about this Privacy Policy, want to exercise your rights, or have
                a privacy concern, please contact us:
              </p>
              <p>
                <strong>Six Labs AI Inc.</strong>
                <br />
                Email:{" "}
                <a href="mailto:mubeen@sixlabs.ai" className="text-primary hover:underline">
                  mubeen@sixlabs.ai
                </a>
                <br />
                Website: sixlabs.ai
              </p>
            </Section>
          </div>
        </article>
      </div>
    </div>
  );
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="space-y-3">
    <h2 className="text-lg font-display font-semibold text-foreground mt-6">{title}</h2>
    {children}
  </section>
);

export default PrivacyPolicy;
