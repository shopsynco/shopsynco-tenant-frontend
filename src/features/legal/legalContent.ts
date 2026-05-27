/**
 * Static legal copy for the tenant dashboard (ShopSynco).
 * Replace with CMS/API content later if needed.
 */

export const LEGAL_ORDER = [
  "terms",
  "privacy",
  "refunds",
  "acceptable-use",
] as const;

export type LegalSlug = (typeof LEGAL_ORDER)[number];

export const LEGAL_NAV: { slug: LegalSlug; label: string }[] = [
  { slug: "terms", label: "Terms & Conditions" },
  { slug: "privacy", label: "Privacy Policy" },
  { slug: "refunds", label: "Refund & Cancellation" },
  { slug: "acceptable-use", label: "Acceptable Use Policy" },
];

function isLegalSlug(s: string): s is LegalSlug {
  return (LEGAL_ORDER as readonly string[]).includes(s);
}

export function parseLegalSlug(param: string | undefined): LegalSlug {
  if (param && isLegalSlug(param)) return param;
  return "terms";
}

type PolicyBlock = { title: string; html: string };

export const LEGAL_POLICIES: Record<LegalSlug, PolicyBlock> = {
  terms: {
    title: "Terms & Conditions",
    html: `
      <p class="mb-4">These Terms &amp; Conditions (“Terms”) govern your use of ShopSynco’s software and services. By creating an account or using the platform, you agree to these Terms.</p>
      <h3 class="text-lg font-semibold text-[#2D2A3E] mt-8 mb-3">1. Services</h3>
      <p class="mb-4">ShopSynco provides cloud-based tools to run your online store, including storefront, catalog, orders, and related features described in your subscription plan.</p>
      <h3 class="text-lg font-semibold text-[#2D2A3E] mt-8 mb-3">2. Accounts</h3>
      <p class="mb-4">You are responsible for safeguarding login credentials and for all activity under your account. You must provide accurate business and contact information.</p>
      <h3 class="text-lg font-semibold text-[#2D2A3E] mt-8 mb-3">3. Acceptable use</h3>
      <p class="mb-4">You agree not to misuse the service, interfere with other users, attempt unauthorized access, or use ShopSynco for unlawful, fraudulent, or harmful activity. See our Acceptable Use Policy for details.</p>
      <h3 class="text-lg font-semibold text-[#2D2A3E] mt-8 mb-3">4. Fees &amp; billing</h3>
      <p class="mb-4">Fees are based on the plan you select. Taxes may apply. Recurring charges continue until you cancel in accordance with our Refund &amp; Cancellation terms.</p>
      <h3 class="text-lg font-semibold text-[#2D2A3E] mt-8 mb-3">5. Intellectual property</h3>
      <p class="mb-4">ShopSynco retains rights in the platform, branding, and documentation. You retain rights to your own content and customer data, subject to the license needed to operate the service.</p>
      <h3 class="text-lg font-semibold text-[#2D2A3E] mt-8 mb-3">6. Limitation of liability</h3>
      <p class="mb-4">To the maximum extent permitted by law, ShopSynco is not liable for indirect or consequential damages. Our aggregate liability is limited to amounts paid by you for the service in the preceding twelve months.</p>
      <h3 class="text-lg font-semibold text-[#2D2A3E] mt-8 mb-3">7. Changes</h3>
      <p class="mb-4">We may update these Terms. Material changes will be communicated in-product or by email where appropriate. Continued use after changes constitutes acceptance.</p>
      <h3 class="text-lg font-semibold text-[#2D2A3E] mt-8 mb-3">8. Contact</h3>
      <p>For questions about these Terms, contact support through your ShopSynco dashboard or the email address provided on our website.</p>
    `,
  },
  privacy: {
    title: "Privacy Policy",
    html: `
      <p class="mb-4">This Privacy Policy explains how ShopSynco collects, uses, and protects information when you use our tenant dashboard and related services.</p>
      <h3 class="text-lg font-semibold text-[#2D2A3E] mt-8 mb-3">1. Information we collect</h3>
      <ul class="list-disc pl-6 space-y-2 mb-4">
        <li><strong>Account data:</strong> name, email, phone, and business details you provide.</li>
        <li><strong>Usage data:</strong> device, browser, logs, and product interactions to secure and improve the service.</li>
        <li><strong>Payment data:</strong> processed by our payment partners; we do not store full card numbers on our servers.</li>
      </ul>
      <h3 class="text-lg font-semibold text-[#2D2A3E] mt-8 mb-3">2. How we use information</h3>
      <p class="mb-4">We use data to provide and operate the platform, authenticate users, process payments, send service notices, detect abuse, and comply with legal obligations.</p>
      <h3 class="text-lg font-semibold text-[#2D2A3E] mt-8 mb-3">3. Sharing</h3>
      <p class="mb-4">We may share information with subprocessors (hosting, email, analytics, payments) under strict agreements. We do not sell your personal information.</p>
      <h3 class="text-lg font-semibold text-[#2D2A3E] mt-8 mb-3">4. Retention</h3>
      <p class="mb-4">We retain data as long as your account is active and as needed for legal, tax, and security purposes, then delete or anonymize it in line with our retention schedule.</p>
      <h3 class="text-lg font-semibold text-[#2D2A3E] mt-8 mb-3">5. Your rights</h3>
      <p class="mb-4">Depending on your region, you may request access, correction, export, or deletion of personal data. Contact us to exercise these rights.</p>
      <h3 class="text-lg font-semibold text-[#2D2A3E] mt-8 mb-3">6. Security</h3>
      <p class="mb-4">We implement administrative, technical, and organizational measures designed to protect data. No method of transmission over the internet is 100% secure.</p>
      <h3 class="text-lg font-semibold text-[#2D2A3E] mt-8 mb-3">7. Updates</h3>
      <p>We may update this policy; the “last updated” notice may appear in-product. Please review periodically.</p>
    `,
  },
  refunds: {
    title: "Refund & Cancellation",
    html: `
      <p class="mb-4">This policy describes how subscription charges, cancellations, and refunds work for ShopSynco plans purchased through the tenant dashboard.</p>
      <h3 class="text-lg font-semibold text-[#2D2A3E] mt-8 mb-3">1. Subscription billing</h3>
      <p class="mb-4">Paid plans renew automatically at the end of each billing period unless you cancel before the renewal date. Fees are non-refundable except as stated below or where required by law.</p>
      <h3 class="text-lg font-semibold text-[#2D2A3E] mt-8 mb-3">2. Cancellation</h3>
      <p class="mb-4">You may cancel recurring billing from billing settings or by contacting support. Cancellation stops future charges; access typically continues until the end of the current paid period.</p>
      <h3 class="text-lg font-semibold text-[#2D2A3E] mt-8 mb-3">3. Refunds</h3>
      <ul class="list-disc pl-6 space-y-2 mb-4">
        <li>If you believe you were charged in error, contact us within 14 days with transaction details.</li>
        <li>Eligible refunds, if approved, are processed to the original payment method where possible.</li>
        <li>Promotional or discounted periods may have separate rules shown at checkout.</li>
      </ul>
      <h3 class="text-lg font-semibold text-[#2D2A3E] mt-8 mb-3">4. Chargebacks</h3>
      <p class="mb-4">Please contact us before disputing a charge with your bank so we can resolve billing issues quickly.</p>
      <h3 class="text-lg font-semibold text-[#2D2A3E] mt-8 mb-3">5. Law</h3>
      <p>Mandatory consumer rights in your jurisdiction apply in addition to this policy.</p>
    `,
  },
  "acceptable-use": {
    title: "Acceptable Use Policy",
    html: `
      <p class="mb-4">ShopSynco may suspend or terminate accounts that violate this Acceptable Use Policy (“AUP”).</p>
      <h3 class="text-lg font-semibold text-[#2D2A3E] mt-8 mb-3">1. Prohibited content &amp; activity</h3>
      <p class="mb-4">You may not use ShopSynco to distribute malware, send spam, harass others, infringe intellectual property, or sell illegal or restricted goods where prohibited by law.</p>
      <h3 class="text-lg font-semibold text-[#2D2A3E] mt-8 mb-3">2. Security</h3>
      <p class="mb-4">Do not probe, scan, or test the vulnerability of our systems without authorization. Do not attempt to access data that does not belong to you.</p>
      <h3 class="text-lg font-semibold text-[#2D2A3E] mt-8 mb-3">3. Resource use</h3>
      <p class="mb-4">Automated scraping, excessive API usage, or activity that degrades service for others may be throttled or blocked.</p>
      <h3 class="text-lg font-semibold text-[#2D2A3E] mt-8 mb-3">4. Enforcement</h3>
      <p class="mb-4">We may warn, suspend, or terminate accounts; remove content; or involve law enforcement where appropriate. Nothing limits remedies available under our Terms.</p>
      <h3 class="text-lg font-semibold text-[#2D2A3E] mt-8 mb-3">5. Reporting</h3>
      <p>Report suspected abuse to ShopSynco support with relevant details and URLs.</p>
    `,
  },
};
