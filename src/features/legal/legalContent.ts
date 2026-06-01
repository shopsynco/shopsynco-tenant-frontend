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

// ─── shared heading helper (used inline in template literals) ─────────────────
const H = (n: number, text: string) =>
  `<h3 class="text-lg font-semibold text-[#2D2A3E] mt-8 mb-3">${n}. ${text}</h3>`;

export const LEGAL_POLICIES: Record<LegalSlug, PolicyBlock> = {
  // ── TERMS & CONDITIONS ────────────────────────────────────────────────────
  terms: {
    title: "Terms & Conditions",
    html: `
<p class="mb-2 text-xs text-gray-400">Last updated: May 2025 &mdash; Effective immediately upon account creation or plan purchase.</p>
<p class="mb-4">These Terms &amp; Conditions (&ldquo;Terms&rdquo;) constitute a legally binding agreement between you (&ldquo;Merchant&rdquo;, &ldquo;you&rdquo;) and ShopSynco Technologies (&ldquo;ShopSynco&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;). By registering an account, activating a store, or using any part of the ShopSynco platform, you unconditionally accept these Terms in their entirety. If you do not agree, do not use the platform.</p>

${H(1, "Services")}
<p class="mb-4">ShopSynco provides cloud-based software-as-a-service (SaaS) tools that allow merchants to create, manage, and operate an online store &mdash; including storefront presentation, product catalogue, order management, payment processing via Razorpay, customer management, analytics, and the features described in the selected subscription plan.</p>

${H(2, "Accounts &amp; Registration")}
<p class="mb-4">You must provide accurate, current, and complete information during registration and keep it updated at all times. You are solely responsible for safeguarding login credentials and for all activity that occurs under your account. Accounts may only be held by individuals or entities legally permitted to enter into contracts in their jurisdiction. We reserve the right to reject or suspend any account at our sole discretion.</p>

${H(3, "Subscription Plans &amp; Billing")}
<p class="mb-2">ShopSynco offers three subscription tiers &mdash; <strong>Starter</strong>, <strong>Growth</strong>, and <strong>Pro</strong> &mdash; each available with monthly, 6-month, yearly, and 2-year billing options. Longer billing periods attract a prepaid discount as shown at checkout.</p>
<ul class="list-disc pl-6 space-y-2 mb-4">
  <li>All subscription fees are billed <strong>in advance</strong> for the chosen period.</li>
  <li>Subscriptions renew automatically unless cancelled before the renewal date.</li>
  <li>Applicable taxes (GST or other levies) will be added as required by law.</li>
  <li>Feature Store add-ons are billed monthly and may be cancelled separately from the base plan.</li>
  <li>Free trials for Feature Store add-ons (7 days for Starter; 14 days for Growth and Pro) require no upfront payment. If not cancelled before the trial ends, paid billing commences automatically.</li>
</ul>

${H(4, "Transaction Fees &mdash; Detailed Breakdown")}
<p class="mb-3">Every order processed through your ShopSynco store carries the following fees, which are deducted automatically from each transaction settlement:</p>
<div class="overflow-x-auto mb-4">
  <table class="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
    <thead class="bg-[#F3EEFF]">
      <tr>
        <th class="text-left px-4 py-2 font-semibold text-[#2D2A3E]">Fee Component</th>
        <th class="text-left px-4 py-2 font-semibold text-[#2D2A3E]">Starter</th>
        <th class="text-left px-4 py-2 font-semibold text-[#2D2A3E]">Growth</th>
        <th class="text-left px-4 py-2 font-semibold text-[#2D2A3E]">Pro</th>
        <th class="text-left px-4 py-2 font-semibold text-[#2D2A3E]">Recipient</th>
      </tr>
    </thead>
    <tbody class="divide-y divide-gray-100">
      <tr class="bg-white">
        <td class="px-4 py-2">Razorpay payment gateway fee</td>
        <td class="px-4 py-2">2% per order</td>
        <td class="px-4 py-2">2% per order</td>
        <td class="px-4 py-2">2% per order</td>
        <td class="px-4 py-2 text-gray-500">Razorpay (their cut)</td>
      </tr>
      <tr class="bg-gray-50">
        <td class="px-4 py-2"><strong>ShopSynco platform fee</strong></td>
        <td class="px-4 py-2"><strong>1.5% per order</strong></td>
        <td class="px-4 py-2"><strong>1% per order</strong></td>
        <td class="px-4 py-2"><strong>0.5% per order</strong></td>
        <td class="px-4 py-2 text-gray-500">ShopSynco</td>
      </tr>
      <tr class="bg-white">
        <td class="px-4 py-2">Third-party integration fee <em>(only when integrations are active)</em></td>
        <td class="px-4 py-2">0.5% per order</td>
        <td class="px-4 py-2">0.5% per order</td>
        <td class="px-4 py-2">0.5% per order</td>
        <td class="px-4 py-2 text-gray-500">Integration provider</td>
      </tr>
    </tbody>
  </table>
</div>
<p class="mb-3"><strong>How transaction fees are collected:</strong> ShopSynco uses Razorpay Route (split settlement) to automatically separate the ShopSynco platform fee and any third-party integration fee from your earnings at the moment of each transaction. You receive the net settlement in your linked bank account after all applicable fees are deducted. <strong>You do not pay the ShopSynco fee as a separate invoice &mdash; it is deducted directly from the order value before settlement reaches you.</strong></p>
<p class="mb-3"><strong>Non-payment / bypass attempts:</strong> Because the ShopSynco platform fee is deducted automatically via Razorpay Route, there is no scenario in which it goes unpaid on orders processed through our infrastructure. Routing customer payments outside our payment infrastructure specifically to avoid transaction fee deductions constitutes a material breach of these Terms and will result in immediate account suspension, recovery of outstanding fees, and potential legal action.</p>
<p class="mb-3"><strong>Transaction fees are strictly non-refundable.</strong> Once an order has been settled and fees have been deducted, those fees cannot be reversed regardless of whether the underlying order is later refunded, disputed, or charged back by the customer. You bear the full cost of issuing customer refunds, including the original transaction fees that applied to that order.</p>
<p class="mb-4"><strong>Fee revisions:</strong> ShopSynco may revise transaction fee percentages with 30 days&rsquo; written notice. Continued use of the platform after the effective date of a fee change constitutes your acceptance of the revised rates.</p>

${H(5, "Prohibited Products &amp; Content")}
<p class="mb-2">You expressly agree that you will <strong>not</strong> list, sell, market, or facilitate the sale of any of the following categories of goods, services, or content through your ShopSynco store. This list is illustrative and non-exhaustive:</p>
<ul class="list-disc pl-6 space-y-2 mb-4">
  <li><strong>Alcohol &amp; intoxicants:</strong> Alcoholic beverages of any kind, fermentation kits marketed for home alcohol production, or any product whose primary purpose is the production or consumption of alcohol.</li>
  <li><strong>Tobacco &amp; smoking products:</strong> Cigarettes, cigars, bidis, pipe tobacco, raw tobacco leaf, chewing tobacco (gutka, khaini, pan masala with tobacco), electronic cigarettes, vaping devices and e-liquids, nicotine pouches, and all related paraphernalia.</li>
  <li><strong>Pork &amp; pork-derived products:</strong> Pork meat (fresh, frozen, processed, or cured), lard, pork-based gelatin, and any food product or supplement containing pork or pork derivatives as an ingredient. <em>This restriction applies regardless of the religious or dietary context in which such products are offered.</em></li>
  <li><strong>Controlled substances &amp; drugs:</strong> Narcotic drugs, psychotropic substances, prescription medicines sold without a licensed pharmacy registration, recreational drugs, drug precursors, and any item marketed to simulate the effects of controlled substances.</li>
  <li><strong>Weapons, firearms &amp; explosives:</strong> Firearms, pistols, rifles, air guns, swords, prohibited knives, ammunition, explosives, and accessories designed to modify or conceal weapons.</li>
  <li><strong>Counterfeit &amp; infringing goods:</strong> Products bearing third-party trademarks without authorisation; pirated software, media, or digital content; and forged official documents.</li>
  <li><strong>Adult content &amp; services:</strong> Pornographic material, escort services, adult entertainment subscriptions, or any sexually explicit product or service.</li>
  <li><strong>Gambling &amp; lottery:</strong> Betting services, online casinos, lottery tickets, or any product or service that constitutes gambling under applicable Indian law.</li>
  <li><strong>Human exploitation:</strong> Products or services facilitating human trafficking, forced labour, child exploitation, or any form of modern slavery.</li>
  <li><strong>Endangered species &amp; wildlife:</strong> Products made from, or containing, species protected under the Wildlife Protection Act 1972 or CITES conventions.</li>
  <li><strong>Hazardous chemicals:</strong> Pesticides, toxic chemicals, or hazardous substances not licensed for general retail under applicable Indian regulations.</li>
  <li><strong>Fraudulent goods:</strong> Products making false medical or health claims; fake certificates or degrees; anything designed to deceive consumers.</li>
  <li><strong>Any other illegal, prohibited, or regulated product</strong> under applicable Indian law or any state law.</li>
</ul>
<p class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 font-semibold">&#9888;&#65039; Violation of this clause results in <strong>immediate and permanent account termination without prior notice, without refund, and without the right to appeal</strong>. ShopSynco reserves the right to report violations to relevant law enforcement and regulatory authorities. See the Acceptable Use Policy for the complete enforcement framework.</p>

${H(6, "Acceptable Use")}
<p class="mb-4">You agree not to misuse the service, interfere with other users, attempt unauthorised access, reverse-engineer the platform, or use ShopSynco for any unlawful, fraudulent, or harmful purpose. The Acceptable Use Policy section of this document sets out the complete list of restrictions and the enforcement process.</p>

${H(7, "Intellectual Property")}
<p class="mb-4">ShopSynco retains all rights in the platform, software, branding, and documentation. You retain ownership of your own product content and customer data, subject to the limited licence you grant us to operate the service (e.g., hosting product images, processing orders). You must not use ShopSynco&rsquo;s brand name, logo, or trademarks without prior written consent.</p>

${H(8, "Suspension &amp; Termination")}
<p class="mb-4">We may suspend or terminate your account immediately and without notice if: (a) you violate the Prohibited Products clause or any other material term of these Terms; (b) we receive a valid legal order to do so; (c) your account is used for fraudulent or criminal activity; or (d) non-payment of subscription fees causes your plan to lapse. Upon termination, your storefront and dashboard are deactivated. Data is retained for legally required periods and then deleted per our Privacy Policy. <strong>No refund is payable for any unused subscription period upon termination for cause.</strong></p>

${H(9, "Limitation of Liability")}
<p class="mb-4">To the fullest extent permitted by applicable law, ShopSynco is not liable for indirect, incidental, special, consequential, or punitive damages, including loss of profits, revenue, data, goodwill, or business interruption. Our total aggregate liability to you for any single claim is limited to the amounts you actually paid to ShopSynco in the three calendar months immediately preceding the event giving rise to the claim.</p>

${H(10, "Governing Law &amp; Disputes")}
<p class="mb-4">These Terms are governed by the laws of India. Any dispute shall first be submitted to good-faith negotiation. If unresolved within 30 days, it shall be referred to arbitration under the Arbitration and Conciliation Act, 1996, with proceedings in English in Bangalore, Karnataka, India.</p>

${H(11, "Changes to These Terms")}
<p class="mb-4">We may update these Terms at any time. Material changes will be communicated in-product or by email at least 14 days before taking effect. Continued use after the effective date constitutes acceptance of the revised Terms.</p>

${H(12, "Contact")}
<p>For questions about these Terms, contact us at <strong>legal@shopsynco.com</strong> or via the support portal in your ShopSynco manager dashboard.</p>
`,
  },

  // ── PRIVACY POLICY ────────────────────────────────────────────────────────
  privacy: {
    title: "Privacy Policy",
    html: `
<p class="mb-2 text-xs text-gray-400">Last updated: May 2025.</p>
<p class="mb-4">This Privacy Policy explains how ShopSynco Technologies (&ldquo;ShopSynco&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;) collects, uses, stores, and protects information when you use the ShopSynco merchant dashboard and related services.</p>

${H(1, "Information We Collect")}
<ul class="list-disc pl-6 space-y-2 mb-4">
  <li><strong>Account &amp; identity data:</strong> Full name, business name, email address, phone number, PAN/GST details, and bank account information provided during onboarding.</li>
  <li><strong>Store content:</strong> Product listings, images, descriptions, pricing, and CMS content you publish through the platform.</li>
  <li><strong>Transaction data:</strong> Order details, customer purchase records, payment amounts, fee deductions, and settlement records processed through Razorpay.</li>
  <li><strong>Usage data:</strong> Browser type, IP address, device identifiers, session logs, feature interactions, and error reports &mdash; collected automatically to secure and improve the platform.</li>
  <li><strong>Payment data:</strong> All payment card and bank data is processed directly by Razorpay under their PCI-DSS compliant infrastructure. ShopSynco does not store full card numbers on our servers.</li>
  <li><strong>Customer data you hold:</strong> Your customers&rsquo; names, addresses, order history, and contact details are stored within your isolated store schema. ShopSynco processes this data solely as a data processor acting on your instructions.</li>
</ul>

${H(2, "How We Use Information")}
<p class="mb-4">We use collected information to: provide, operate, and maintain the platform; authenticate users and prevent fraud; process subscription payments and transaction fee deductions via Razorpay Route; send service notifications (including subscription expiry reminders); generate analytics and reports for your dashboard; comply with legal, tax, and regulatory obligations; and improve platform features and security.</p>

${H(3, "Sharing &amp; Disclosure")}
<p class="mb-4">We may share information with: (a) <strong>Razorpay</strong> for payment processing and split settlements; (b) <strong>AWS</strong> for cloud hosting and media storage; (c) <strong>email service providers</strong> for transactional notifications; (d) <strong>analytics providers</strong> for platform improvement; and (e) <strong>law enforcement or regulatory authorities</strong> where required by a valid court order or applicable law. <strong>We do not sell your personal information to third parties for marketing purposes.</strong></p>

${H(4, "Data Retention")}
<p class="mb-4">We retain account and transaction data for a minimum of 7 years as required under Indian tax and financial regulations. Usage logs are retained for 90 days. Customer data within your store schema is retained until you request deletion or your account is terminated, after which it is deleted within 30 days unless a legal hold applies.</p>

${H(5, "Your Rights")}
<p class="mb-4">Subject to applicable law, you may request access to, correction of, export of, or deletion of your personal data by contacting <strong>privacy@shopsynco.com</strong>. We will respond within 30 days. Certain data cannot be deleted while a legal retention obligation is in force.</p>

${H(6, "Security")}
<p class="mb-4">We implement industry-standard measures including encryption in transit (TLS 1.2+), encryption at rest, role-based access controls, and regular security audits. No method of internet transmission is 100% secure; you are also responsible for securing your account credentials.</p>

${H(7, "Updates")}
<p>We may revise this Privacy Policy. The updated version will be published in-platform with a revised &ldquo;last updated&rdquo; date. We recommend reviewing it periodically.</p>
`,
  },

  // ── REFUND & CANCELLATION ─────────────────────────────────────────────────
  refunds: {
    title: "Refund & Cancellation",
    html: `
<p class="mb-2 text-xs text-gray-400">Last updated: May 2025.</p>
<p class="mb-4">This policy governs refunds and cancellations for all ShopSynco subscription plans and Feature Store add-ons. Please read it carefully before purchasing &mdash; by completing a purchase you confirm that you have read and understood this policy.</p>

${H(1, "No Refund Policy")}
<div class="mb-4 p-3 bg-amber-50 border border-amber-300 rounded-lg">
  <p class="font-semibold text-amber-800">&#9888;&#65039; All subscription fees paid to ShopSynco &mdash; including monthly, 6-month, yearly, and 2-year plans, as well as Feature Store add-on subscriptions &mdash; are <strong>strictly non-refundable</strong> once payment has been processed.</p>
</div>
<p class="mb-2">Specifically, this means:</p>
<ul class="list-disc pl-6 space-y-2 mb-4">
  <li>If you purchase an annual plan and choose to stop using ShopSynco after one month, you will <strong>not</strong> receive a refund for the remaining eleven months.</li>
  <li>If you are on a monthly plan and cancel part-way through the month, you will <strong>not</strong> receive a prorated refund for unused days.</li>
  <li>If your account is terminated for violation of our Terms (including the Prohibited Products policy), you will <strong>not</strong> receive any refund of subscription fees paid, regardless of the remaining period.</li>
  <li>Feature Store free trials that convert to paid subscriptions are subject to the same no-refund rule once the trial period has ended and billing has commenced.</li>
  <li>Prepaid multi-month discounts (6-month, yearly, 2-year) are not refundable in part or in full.</li>
</ul>

${H(2, "Transaction Fees &mdash; Non-Refundable")}
<p class="mb-2">Transaction fees (ShopSynco platform fee + Razorpay gateway fee) are deducted automatically from each settled order via Razorpay Route. These fees are earned at the moment of settlement and are <strong>not refundable under any circumstances</strong>, including where:</p>
<ul class="list-disc pl-6 space-y-2 mb-4">
  <li>The customer returns the product and receives a full refund from you.</li>
  <li>An order is cancelled after payment but before dispatch.</li>
  <li>A chargeback is successfully initiated by the customer.</li>
  <li>A payment dispute is resolved in the customer&rsquo;s favour by Razorpay or the card network.</li>
</ul>
<p class="mb-4">You are solely responsible for managing customer refunds out of your own settlement proceeds. ShopSynco will not reimburse, credit, or offset transaction fees that have already been deducted on any order, regardless of outcome.</p>

${H(3, "Subscription Cancellation")}
<p class="mb-4">You may cancel the auto-renewal of your subscription at any time from <strong>Settings &rarr; Billing</strong> in your manager dashboard, or by contacting <strong>billing@shopsynco.com</strong>. Cancellation takes effect at the end of the current paid period. You retain full access to all plan features until the period expires. After expiry, your storefront and dashboard are deactivated until you re-subscribe. <strong>Cancellation does not entitle you to a refund for the remaining paid period.</strong></p>

${H(4, "Feature Store Cancellation")}
<p class="mb-4">Feature Store add-ons may be cancelled at any time from your Feature Store settings. Access continues until the end of the current monthly billing cycle. No prorated credit or refund is issued for unused days within the paid cycle.</p>

${H(5, "Billing Errors")}
<p class="mb-4">If you believe you were charged in error (for example, double-charged for the same billing period), contact us at <strong>billing@shopsynco.com</strong> within 14 days of the charge, providing your account details and the Razorpay payment reference. We will investigate and, if a billing error is confirmed, process a correction or credit.</p>

${H(6, "Chargebacks")}
<p class="mb-4">Please contact us before disputing a charge with your bank or card provider. Initiating a chargeback without first contacting ShopSynco support may result in immediate account suspension pending investigation. A confirmed fraudulent or unjustified chargeback may result in permanent account termination and recovery of disputed amounts through available legal remedies.</p>

${H(7, "Statutory Rights")}
<p>Nothing in this policy limits any mandatory rights you may have under the Consumer Protection Act, 2019 or other applicable Indian statute that cannot be excluded by contract.</p>
`,
  },

  // ── ACCEPTABLE USE POLICY ─────────────────────────────────────────────────
  "acceptable-use": {
    title: "Acceptable Use Policy",
    html: `
<p class="mb-2 text-xs text-gray-400">Last updated: May 2025.</p>
<p class="mb-4">This Acceptable Use Policy (&ldquo;AUP&rdquo;) defines how ShopSynco&rsquo;s platform may and may not be used. It supplements the Terms &amp; Conditions and the Refund &amp; Cancellation policy. Violation of this AUP may result in immediate account suspension or permanent termination without notice or refund.</p>

${H(1, "Absolutely Prohibited Products &amp; Categories")}
<p class="mb-3">The following product categories are <strong>strictly and unconditionally banned</strong> on ShopSynco. Listing, selling, promoting, or facilitating the sale of any item in these categories is a <strong>zero-tolerance violation</strong> that will result in <strong>immediate and permanent account termination without prior notice, without any refund, and without the right to appeal through standard support channels.</strong></p>

<div class="space-y-3 mb-5">

  <div class="p-3 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
    <p class="font-semibold text-red-700 mb-1">&#127866; Alcohol &amp; Intoxicants</p>
    <p class="text-sm text-gray-700">Beer, wine, spirits (whisky, rum, vodka, gin, etc.), country liquor, fermented beverages, home-brewing kits, distillation equipment marketed for alcohol production, and any product whose primary purpose is the production or consumption of alcohol. Sale of alcohol in India is governed by individual state excise laws and requires specific licences that ShopSynco is not equipped to facilitate or verify.</p>
  </div>

  <div class="p-3 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
    <p class="font-semibold text-red-700 mb-1">&#128684; Tobacco &amp; Nicotine Products</p>
    <p class="text-sm text-gray-700">Cigarettes, cigars, bidis, pipe tobacco, raw tobacco leaf, chewing tobacco (gutka, khaini, zarda), pan masala containing tobacco, hookah tobacco and accessories, electronic cigarettes (e-cigarettes), personal vaporisers, vaping devices and their components (coils, pods, tanks), e-liquids (with or without nicotine), nicotine pouches, nicotine patches or gum intended for recreational rather than medically supervised use, and smoking paraphernalia primarily associated with tobacco consumption.</p>
  </div>

  <div class="p-3 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
    <p class="font-semibold text-red-700 mb-1">&#129367; Pork &amp; Pork-Derived Products</p>
    <p class="text-sm text-gray-700">Fresh pork, frozen pork, cured pork (bacon, ham, prosciutto, salami, pepperoni), pork sausages, lard, pork dripping, pork-based gelatin, and any food product, supplement, or consumable that lists pork or pork derivatives as an ingredient. <strong>This restriction applies unconditionally and regardless of the religious, dietary, cultural, or geographic context in which such products are offered or the audience they are marketed to.</strong></p>
  </div>

  <div class="p-3 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
    <p class="font-semibold text-red-700 mb-1">&#128138; Controlled Substances &amp; Drugs</p>
    <p class="text-sm text-gray-700">Narcotic drugs and psychotropic substances under the NDPS Act, 1985; prescription medicines sold without a valid licensed pharmacy registration under the Drugs and Cosmetics Act, 1940; Schedule H and Schedule X drugs without prescription; recreational drugs; research chemicals marketed as drug substitutes; drug precursors and synthesis chemicals; synthetic cannabinoids; kratom; and any product marketed, labelled, or known to produce the effects of a controlled substance.</p>
  </div>

  <div class="p-3 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
    <p class="font-semibold text-red-700 mb-1">&#128299; Weapons, Firearms &amp; Explosives</p>
    <p class="text-sm text-gray-700">Firearms of any category (pistols, rifles, revolvers, shotguns, air guns), ammunition and cartridges, silencers, bump stocks, prohibited knives and blades, swords, tasers, stun guns, explosives, detonators, blasting caps, fireworks classified as hazardous under applicable law, and any accessory whose primary design purpose is to modify, silence, enhance lethality, or conceal a weapon. Sale of most such items requires an Arms Act licence, which ShopSynco cannot facilitate.</p>
  </div>

  <div class="p-3 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
    <p class="font-semibold text-red-700 mb-1">&#128092; Counterfeit &amp; Infringing Goods</p>
    <p class="text-sm text-gray-700">Products bearing the trademarks, logos, trade dress, or design patents of third-party brands without their genuine written authorisation; replica or &ldquo;inspired by&rdquo; luxury goods; pirated software, video games, films, music albums, or e-books; and fake or forged official documents including academic certificates, government IDs, driving licences, and hall tickets.</p>
  </div>

  <div class="p-3 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
    <p class="font-semibold text-red-700 mb-1">&#128286; Adult &amp; Explicit Content</p>
    <p class="text-sm text-gray-700">Pornographic material in any digital or physical format; escort or companionship services; adult entertainment subscriptions; sex toys marketed to adults in a manner that violates community standards; and any content depicting minors in a sexual context. The latter may also constitute a criminal offence and will be reported to law enforcement.</p>
  </div>

  <div class="p-3 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
    <p class="font-semibold text-red-700 mb-1">&#127922; Gambling &amp; Betting</p>
    <p class="text-sm text-gray-700">Online casino services, sports betting platforms, lottery tickets, scratch cards, prediction markets operating without regulatory approval, fantasy sports platforms operating outside their applicable regulatory framework, slot machine software, and any other product or service that constitutes gambling under the Public Gambling Act, 1867 or applicable state gambling legislation.</p>
  </div>

  <div class="p-3 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
    <p class="font-semibold text-red-700 mb-1">&#129409; Endangered Species &amp; Wildlife Products</p>
    <p class="text-sm text-gray-700">Products made from or containing any animal or plant species protected under the Wildlife Protection Act, 1972 (India) or Appendices I and II of CITES &mdash; including ivory, rhino horn, tiger skins and bones, shahtoosh (Tibetan antelope wool), sea turtle shells, protected bird species and their eggs, and coral. This includes both raw materials and processed products derived from such species.</p>
  </div>

  <div class="p-3 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
    <p class="font-semibold text-red-700 mb-1">&#128101; Human Exploitation</p>
    <p class="text-sm text-gray-700">Products, services, content, or listings that facilitate, enable, or promote human trafficking, debt bondage, forced labour, child labour, forced marriage, sexual exploitation, or any other form of modern slavery as defined under applicable Indian law.</p>
  </div>

  <div class="p-3 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
    <p class="font-semibold text-red-700 mb-1">&#9763;&#65039; Hazardous Chemicals &amp; Biological Agents</p>
    <p class="text-sm text-gray-700">Industrial-grade pesticides, herbicides, rodenticides, and toxic solvents not licensed for general retail sale; biological agents, pathogens, and toxins; radioactive materials; and any substance classified as a hazardous chemical under the Manufacture, Storage and Import of Hazardous Chemical Rules, 1989 or any successor regulation.</p>
  </div>

  <div class="p-3 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
    <p class="font-semibold text-red-700 mb-1">&#127973; Fraudulent &amp; Misleading Health Products</p>
    <p class="text-sm text-gray-700">Products making unsubstantiated cure or treatment claims for regulated medical conditions (cancer, diabetes, HIV, etc.); miracle weight-loss products with fabricated testimonials; unapproved medical devices; products misleadingly labelled as &ldquo;Ayurvedic&rdquo;, &ldquo;herbal&rdquo;, or &ldquo;natural&rdquo; while containing undisclosed pharmaceutical or controlled ingredients; and any product that violates the Drugs and Magic Remedies (Objectionable Advertisements) Act, 1954.</p>
  </div>

  <div class="p-3 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
    <p class="font-semibold text-red-700 mb-1">&#128683; Any Other Illegal or Government-Banned Product</p>
    <p class="text-sm text-gray-700">Any product or service that is illegal under the laws of India or any Indian state; subject to a government-mandated sale ban or import restriction; or that ShopSynco has otherwise communicated (via updated policies or direct notice) as prohibited on the platform.</p>
  </div>

</div>

<div class="p-4 bg-red-50 border border-red-400 rounded-lg mb-4">
  <p class="text-red-700 font-bold text-sm">&#9888;&#65039; Enforcement &mdash; Zero Tolerance</p>
  <p class="text-red-700 text-sm mt-1">ShopSynco reserves the right to determine, in its sole and final discretion, whether any product, listing, or activity falls within a prohibited category. Upon such a determination &mdash; or upon receipt of a credible complaint from a third party or authority &mdash; <strong>the merchant&rsquo;s store will be blocked immediately and without prior notice</strong>. The account will be permanently terminated. No refund of subscription fees, transaction fees, or any other amount paid will be issued. ShopSynco may report violations, along with any relevant merchant details, to law enforcement agencies, the Enforcement Directorate, FSSAI, drug control authorities, or any other applicable regulatory body.</p>
</div>

${H(2, "Prohibited Technical Activities")}
<ul class="list-disc pl-6 space-y-2 mb-4">
  <li>Probing, scanning, or testing ShopSynco system vulnerabilities without written authorisation.</li>
  <li>Attempting to circumvent or disable security, rate limiting, authentication, or access control mechanisms.</li>
  <li>Automated scraping of ShopSynco platform data beyond what the official API explicitly permits.</li>
  <li>Uploading or transmitting malware, ransomware, viruses, or any destructive or malicious code.</li>
  <li>Reverse-engineering, decompiling, or disassembling any part of the ShopSynco software or infrastructure.</li>
  <li>Routing customer payments through external payment channels to avoid transaction fee deductions.</li>
  <li>Creating multiple accounts to circumvent plan limits, feature restrictions, or account bans.</li>
</ul>

${H(3, "Prohibited Business Practices")}
<ul class="list-disc pl-6 space-y-2 mb-4">
  <li>Misrepresenting your identity, your business, or your products to ShopSynco or to customers.</li>
  <li>Artificially inflating order volumes, review counts, wishlist activity, or store metrics.</li>
  <li>Engaging in any form of money laundering or using ShopSynco to process illicit funds.</li>
  <li>Publishing false, misleading, or defamatory content about competitors on your store or in reviews.</li>
  <li>Using ShopSynco-hosted storefronts to conduct phishing, social engineering, or identity theft.</li>
</ul>

${H(4, "Resource Use")}
<p class="mb-4">Automated scraping, excessive API calls, or usage patterns that materially degrade service quality for other merchants may be throttled or blocked without notice. If your usage substantially exceeds normal patterns for your plan tier, we may contact you to discuss an appropriate plan upgrade or custom usage agreement.</p>

${H(5, "Enforcement")}
<p class="mb-4">ShopSynco may, at its sole discretion and at any time: remove or disable any content that violates this AUP; throttle or restrict specific features or API access; suspend your account temporarily pending investigation; or permanently terminate your account. <strong>For prohibited product violations, termination is immediate and permanent with no right of reinstatement.</strong> For other AUP violations, we may (but are not obligated to) issue a warning before taking further action. Nothing in this section limits our rights or remedies under the Terms &amp; Conditions, applicable law, or equitable principles.</p>

${H(6, "Reporting Violations")}
<p>If you become aware of a ShopSynco store that appears to be selling prohibited products or otherwise violating this AUP, please report it immediately to <strong>abuse@shopsynco.com</strong> with the store URL, screenshots or evidence, and a brief description. We take all reports seriously and investigate promptly. Your identity will be kept confidential to the extent permitted by law.</p>
`,
  },
};
