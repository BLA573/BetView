import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import FooterSection from "@/components/landing/FooterSection";
import ThemeToggle from "@/components/shared/ThemeToggle";

const PrivacyPolicy = () => {
  return (
    <main className="min-h-screen bg-background page-transition">
      {/* Header */}
      <nav className="flex items-center justify-between px-6 md:px-16 py-6 border-b border-border">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg gradient-blue flex items-center justify-center shadow-blue">
            <span className="text-primary-foreground font-display font-bold text-sm">B</span>
          </div>
          <span className="font-display font-semibold text-xl text-foreground tracking-tight">
            BetView <span className="text-accent font-light">ቤት View</span>
          </span>
        </Link>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
        </div>
      </nav>

      {/* Privacy Policy Content */}
      <section className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-12 text-muted-foreground">
        <div className="mb-8 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md text-sm text-amber-800 dark:text-amber-300">
          <strong>Disclaimer:</strong> This template is for informational purposes. Consult a qualified legal professional to ensure compliance with your local regulations.
        </div>

        <h1 className="text-3xl font-display font-bold mb-8 text-foreground">Privacy Policy</h1>

        <section className="mb-10" id="introduction-scope">
          <h2 className="text-2xl font-display font-semibold mb-4 text-foreground">1. Introduction & Scope</h2>
          <p className="mb-4">
            Welcome to Bet View ("we," "our," or "us"). We recognize that purchasing, selling, or renting real estate involves the exchange of highly sensitive personal and financial information. Consequently, we are deeply committed to protecting your privacy and ensuring complete transparency in how we collect, process, and safeguard your data. This Privacy Policy details the lifecycle of your personal information when you interact with the Bet View real estate marketplace platform, including our website, mobile applications, and associated services (collectively, the "Services").
          </p>
          <p className="mb-4">
            This Privacy Policy applies to all individuals and entities engaging with our Services. This encompasses property seekers browsing listings, verified agencies conducting business on the platform, and property owners. By accessing or utilizing the Bet View platform, you acknowledge that you have read and comprehensively understood the practices described herein. If you do not consent to our data practices, we respectfully request that you refrain from using our Services.
          </p>
          <p className="mb-4">
            We have deliberately designed our data protection protocols to align with stringent international standards, including the General Data Protection Regulation (GDPR) and the California Consumer Privacy Act (CCPA), aiming to ensure that your privacy rights are universally respected.
          </p>
        </section>

        <section className="mb-10" id="information-we-collect">
          <h2 className="text-2xl font-display font-semibold mb-4 text-foreground">2. Information We Collect</h2>
          <p className="mb-4">
            To operate effectively as a multi-sided marketplace connecting property seekers with verified agencies, Bet View must collect specific categories of information. We adhere strictly to the principle of data minimization, meaning we only collect what is necessary.
          </p>
          
          <h3 className="text-xl font-medium mb-2 text-foreground">Account Information</h3>
          <p className="mb-4">
            When you register for a user or agency dashboard, we require foundational contact details, including your first and last name, email address, phone number, and a secure password. For real estate professionals undergoing agency onboarding, we collect additional operational data. This may include corporate registration numbers, trade licenses, physical office locations, and authorized representative identification to rigorously verify the agency's authenticity and protect platform users from fraudulent listings.
          </p>

          <h3 className="text-xl font-medium mb-2 text-foreground">Property Listings & Interactions</h3>
          <p className="mb-4">
            When agencies or sellers upload property listings, we capture descriptive details, precise geolocations, floor plans, pricing structures, and media assets (images/videos). For property seekers, our platform actively logs your interactions. This includes your specific search criteria, your curated lists of saved properties, details pertaining to visit request scheduling (such as preferred dates and times), and any direct text inquiries dispatched to listing agents.
          </p>

          <h3 className="text-xl font-medium mb-2 text-foreground">Payment & Verification Data</h3>
          <p className="mb-4">
            As part of establishing trust and executing premium services, we facilitate financial verifications. When settling platform fees, agency subscriptions, or initiating transaction deposits, we collect payment proof uploads. Given our operational regions, this frequently includes transaction receipt numbers, screenshots, and metadata from banking systems like CBE (Commercial Bank of Ethiopia) or mobile money providers like Telebirr. We do not natively process or store raw credit card numbers or highly sensitive routing details on our proprietary servers.
          </p>

          <h3 className="text-xl font-medium mb-2 text-foreground">Usage & Analytics Information</h3>
          <p className="mb-4">
            We autonomously collect behavioral metrics concerning how you navigate the Bet View platform. This includes tracking search query terms, page viewing durations, interface elements you engage with, and historical session pathways. This data is instrumental in debugging user experience bottlenecks and algorithmically improving our property recommendation engines.
          </p>

          <h3 className="text-xl font-medium mb-2 text-foreground">Device & Technical Data</h3>
          <p className="mb-4">
            Upon connecting to Bet View, our infrastructure automatically parses technical diagnostics. This log data comprises your Internet Protocol (IP) address, browser user-agent string, operating system version, device identifiers, referring/exit URLs, and time-stamped connection logs. We leverage this solely for cybersecurity auditing, load balancing, and preventing distributed denial-of-service (DDoS) anomalies.
          </p>
        </section>

        <section className="mb-10" id="how-we-use-information">
          <h2 className="text-2xl font-display font-semibold mb-4 text-foreground">3. How We Use Your Information</h2>
          <p className="mb-4">
            The information we compile is utilized exclusively for legitimate business purposes intrinsically linked to delivering a premium real estate marketplace experience. Our processing activities include:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li><strong>Providing Core Platform Operations:</strong> To authenticate your identity, provision personalized user/agency dashboards, dynamically render saved properties, and flawlessly execute complex workflows like visit request scheduling between distinct user groups.</li>
            <li><strong>Transactional Communication & Notifications:</strong> To dispatch mission-critical alerts. We utilize your contact details for automated email/SMS notifications confirming visit requests, signaling status changes on applications, or alerting you to urgent security notices.</li>
            <li><strong>Security, Verification & Trust:</strong> To meticulously vet incoming agency onboarding applications, cross-reference submitted payment proof uploads (CBE/Telebirr) against our ledgers, investigate suspicious activities, and maintain a sterile environment free from scams.</li>
            <li><strong>Service Optimization & Research:</strong> To perform macro-level data analysis on housing market trends, refine our search architecture, and deploy updates that solve genuine pain points observed in our usage analytics.</li>
            <li><strong>Legal Fulfillment & Compliance:</strong> To establish binding legal agreements (Terms of Service), adhere to local financial taxation reporting, and lawfully respond to valid subpoenas or governmental mandates.</li>
          </ul>
          <p className="mb-4">
            We emphatically state that Bet View does not engage in automated decision-making or intrusive algorithmic profiling that produces legal or materially significant effects concerning you without explicit, granular consent.
          </p>
        </section>

        <section className="mb-10" id="data-sharing">
          <h2 className="text-2xl font-display font-semibold mb-4 text-foreground">4. Data Sharing & Third-Party Services</h2>
          <p className="mb-4">
            Trust is our currency. We unequivocally do not sell, rent, or haphazardly trade your personal information to unvetted external marketers. We only distribute necessary data subsets to trusted third-party infrastructure providers who act under strict confidentiality provisions, and to other platform users solely to facilitate your requested real estate transactions.
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li><strong>Authentication & Data Storage (Supabase):</strong> We employ Supabase Auth and Storage to operate our core backend infrastructure. Supabase securely manages hashed account credentials and persistently hosts the assets you upload, ranging from high-resolution property imagery to confidential agency onboarding PDFs.</li>
            <li><strong>Communication Delivery Networks (Resend & SMS Providers):</strong> To guarantee you receive time-sensitive email/SMS notifications, we route your contact identifiers through Resend (for scalable email dispatch) and localized SMS gateway partners. These entities solely process data for the act of message transmission.</li>
            <li><strong>Payment Processing Gateways:</strong> We integrate with specialized financial processors to audit payment proof uploads and reconcile CBE or Telebirr transactions. We share only the transactional metadata required to validate the payment event successfully.</li>
            <li><strong>Analytics & Telemetry Providers:</strong> We employ specialized analytics dashboards to aggregate anonymized visitor metrics, helping our engineering team discern platform health and feature adoption rates without pinpointing individual identities.</li>
            <li><strong>Marketplace Counterparties:</strong> When a property seeker utilizes the visit request scheduling feature or submits an inquiry, their requisite contact details and messages are inherently shared with the verified agency representing that specific listing, enabling the real estate connection to occur.</li>
          </ul>
        </section>

        <section className="mb-10" id="data-retention-security">
          <h2 className="text-2xl font-display font-semibold mb-4 text-foreground">5. Data Retention & Security Measures</h2>
          <p className="mb-4">
            We uphold stringent data retention schedules. Your personal information is actively maintained only for the duration that your user or agency dashboard remains open and active, or as long as necessary to fulfill the operational purposes dictated in this Privacy Policy.
          </p>
          <p className="mb-4">
            Should you initiate an account deletion procedure, your profile data, saved properties, and active listings will be securely purged from our production databases within thirty (30) days. Notwithstanding this, regulatory frameworks compel us to preserve specific administrative records—such as verified payment proof uploads, billing histories, and terms of service acceptance logs—for up to seven (7) years to satisfy anti-money laundering (AML) protocols and commercial taxation audits.
          </p>
          <p className="mb-4">
            From a security standpoint, Bet View enforces commercially rigorous technical, physical, and organizational safeguards. This includes enforcing Transport Layer Security (TLS) encryption on all network transit, utilizing robust hashing for credentials via Supabase, and implementing principle-of-least-privilege access controls for our internal engineering staff. However, we acknowledge that no digital transmission or cloud storage framework is entirely immune to sophisticated breaches. While we proactively defend our infrastructure, we cannot warrant an environment that is totally impregnable.
          </p>
        </section>

        <section className="mb-10" id="your-rights-controls">
          <h2 className="text-2xl font-display font-semibold mb-4 text-foreground">6. Your Rights & Controls</h2>
          <p className="mb-4">
            We believe you should exercise sovereign control over your digital footprint. In alignment with global frameworks like GDPR and CCPA, you are entitled to the following actionable rights regarding your personal data:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li><strong>Right to Access (Know):</strong> You possess the right to demand a comprehensive disclosure detailing the specific pieces of personal data Bet View has curated about you over the past 12 months.</li>
            <li><strong>Right to Rectification (Correct):</strong> Should any data point in your user/agency dashboard become outdated or erroneous, you have the interface tools to rectify it instantly.</li>
            <li><strong>Right to Erasure (Delete):</strong> You may instruct us to permanently delete your personal information, a request we will execute absent conflicting legal retention mandates.</li>
            <li><strong>Right to Data Portability:</strong> You may request a structured, commonly recognized, machine-readable export of your data to seamlessly transition to an alternative service provider.</li>
            <li><strong>Right to Object & Opt-Out:</strong> You retain the absolute right to opt out of any non-essential, promotional communication. You can manage these preferences directly within your dashboard or via unsubscribe links in our emails. Furthermore, you may object to certain forms of platform analytics tracking.</li>
          </ul>
          <p className="mb-4">
            To invoke any of these rights, please direct your inquiry to our compliance team utilizing the contact channels provided below. We pledge to acknowledge and resolve verified requests within the statutory windows dictated by applicable local and international law.
          </p>
        </section>

        <section className="mb-10" id="cookies-tracking">
          <h2 className="text-2xl font-display font-semibold mb-4 text-foreground">7. Cookies, Tracking & Local Storage</h2>
          <p className="mb-4">
            The Bet View platform employs cookies, HTML5 local storage, and analogous tracking utilities to establish an intuitive, frictionless browsing experience.
          </p>
          <p className="mb-4">
            We deploy <em>Essential Cookies</em>, which are structurally mandatory for core functions like navigating secure areas and preserving your authenticated session. We utilize <em>Functional Cookies</em> to memorize platform preferences, dynamically retaining your saved properties and regional language settings across sessions. Lastly, we integrate <em>Analytical Cookies</em> to harvest aggregate traffic patterns, helping us diagnose usability bottlenecks.
          </p>
          <p className="mb-4">
            You maintain total autonomy over cookie configurations via your browser's settings pane. You can configure your environment to actively refuse all non-essential cookies or trigger alerts when a tracking script is executed. Please be aware that forcibly blocking essential session cookies will fundamentally impair your ability to log in and access your user/agency dashboards.
          </p>
        </section>

        <section className="mb-10" id="childrens-privacy">
          <h2 className="text-2xl font-display font-semibold mb-4 text-foreground">8. Children's Privacy</h2>
          <p className="mb-4">
            The real estate marketplace environment necessitates that our users possess the legal capacity to enter into binding contracts. Consequently, Bet View is exclusively restricted to individuals eighteen (18) years of age or older.
          </p>
          <p className="mb-4">
            We explicitly do not target, nor do we knowingly collect or solicit personal data from, children under the age of 18. If platform administrators uncover that an account has been instantiated by a minor, or that we have inadvertently absorbed a minor's data without verifiable parental consent, we will execute immediate technical protocols to purge that information entirely from our ecosystem.
          </p>
        </section>

        <section className="mb-10" id="international-transfers">
          <h2 className="text-2xl font-display font-semibold mb-4 text-foreground">9. International Data Transfers & Localization</h2>
          <p className="mb-4">
            Operating as a resilient, cloud-native marketplace requires us to leverage globally distributed server architecture. While we focus heavily on localized real estate markets, your data may be redundantly stored or processed by our infrastructure partners (such as Supabase) in server facilities situated outside of your immediate domestic jurisdiction.
          </p>
          <p className="mb-4">
            When such transnational data flows occur, Bet View mandates strict legal safeguarding. We rely exclusively on recognized legal transfer mechanisms, predominantly Standard Contractual Clauses (SCCs), to assure that our overseas sub-processors respect data confidentiality with an identical degree of rigor as mandated by your home country's regulatory authorities.
          </p>
        </section>

        <section className="mb-10" id="changes-to-policy">
          <h2 className="text-2xl font-display font-semibold mb-4 text-foreground">10. Changes to This Policy</h2>
          <p className="mb-4">
            The digital regulatory landscape and our marketplace features are in a constant state of evolution. Thus, we reserve the right to amend, rewrite, or update this Privacy Policy continuously.
          </p>
          <p className="mb-4">
            Should we implement material shifts in how we process your sensitive information, we will proactively inform you. This will occur via a conspicuous banner notification on the Bet View homepage, an urgent internal notification within your user/agency dashboard, and/or a direct email dispatch prior to the modifications taking effect. The revised policy will be designated by a newly issued "Effective Date." Engaging with our Services post-modification constitutes your acknowledgment and agreement to the updated terms.
          </p>
        </section>

        <section className="mb-10" id="contact-us">
          <h2 className="text-2xl font-display font-semibold mb-4 text-foreground">11. Contact Us & DPO/Compliance Inquiries</h2>
          <p className="mb-4">
            We welcome scrutiny regarding our privacy postures. If you harbor any questions, suspect a data anomaly, or wish to formally exercise your privacy rights, please escalate your concerns directly to our corporate leadership or appointed Data Protection Officer (DPO).
          </p>
          <ul className="list-none pl-0 mb-6 space-y-2 font-medium">
            <li><strong className="text-foreground">Company Legal Name:</strong> Bet View</li>
            <li><strong className="text-foreground">Registered Address:</strong> Online Entity (No registered physical address)</li>
            <li><strong className="text-foreground">Data Protection / Contact Email:</strong> <a className="text-primary hover:underline" href="mailto:hailemichaelsolomon176@gmail.com">hailemichaelsolomon176@gmail.com</a></li>
            <li><strong className="text-foreground">Support Telephone:</strong> <a className="text-primary hover:underline" href="tel:+251931503581">0931503581</a></li>
          </ul>
          
          <div className="bg-secondary/50 border-l-4 border-primary p-4 rounded-r-md">
            <p className="mb-2"><strong className="text-foreground">Effective Date:</strong> May 9, 2026</p>
            <p><strong className="text-foreground">Governing Law/Jurisdiction:</strong> The provisions, interpretations, and dispute resolutions regarding this Privacy Policy shall be exclusively governed by and construed under the laws of Ethiopia (Ethiopian Law).</p>
          </div>
        </section>
      </section>

      <FooterSection />
    </main>
  );
};

export default PrivacyPolicy;
