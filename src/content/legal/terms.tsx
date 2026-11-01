import { legalConfig } from "@/lib/legal/config";
import type { LegalDocument } from "@/lib/legal/types";

export const termsDoc: LegalDocument = {
  intro: (
    <p>
      [Opening paragraph: these Terms govern use of FitnessMode, operated by{" "}
      {legalConfig.operatorName}. By using the site or creating a profile, you agree to them.]
    </p>
  ),
  sections: [
    {
      id: "the-service",
      title: "The service",
      body: (
        <p>
          [Describe it: a free directory where trainers publish a profile and visitors browse and
          contact trainers directly. FitnessMode is not a party to any arrangement between trainers
          and clients.]
        </p>
      ),
    },
    {
      id: "eligibility",
      title: "Eligibility",
      body: <p>[Minimum age and any professional requirements for listing.]</p>,
    },
    {
      id: "accounts",
      title: "Accounts",
      body: (
        <p>
          [Trainers sign in with an email magic link or Google. You are responsible for your account
          and for the accuracy of your profile.]
        </p>
      ),
    },
    {
      id: "listings-moderation",
      title: "Listings and moderation",
      body: (
        <p>
          [New profiles are reviewed before going live (pending → active). We may suspend or remove
          profiles that are inaccurate, inactive, spam, or violate these terms.]
        </p>
      ),
    },
    {
      id: "your-content",
      title: "Content you submit",
      body: (
        <p>
          [You keep ownership of your photos, bio and links, and grant us a license to display them
          on the directory. You confirm you have the right to post them.]
        </p>
      ),
    },
    {
      id: "prohibited",
      title: "Prohibited content",
      body: (
        <p>
          [No unlawful, misleading, infringing, or harmful content; no scraped or fake listings; no
          misuse of the tracking endpoints.]
        </p>
      ),
    },
    {
      id: "no-endorsement",
      title: "No vetting or endorsement",
      body: (
        <p>
          [Important: profiles are self-reported. We do not verify credentials, certifications,
          insurance or background. Visitors deal with trainers at their own risk.]
        </p>
      ),
    },
    {
      id: "dealings",
      title: "Dealings between users",
      body: (
        <p>
          [Sessions, payments and communications are strictly between the client and the trainer. We
          take no commission and are not responsible for them.]
        </p>
      ),
    },
    {
      id: "paid-features",
      title: "Free and paid features",
      body: (
        <p>
          [The directory is free. Optional paid features (e.g. displaying WhatsApp/call buttons,
          featured placement, verified badge) may be offered later under separate pricing.]
        </p>
      ),
    },
    {
      id: "intellectual-property",
      title: "Intellectual property",
      body: <p>[The site, brand and software belong to {legalConfig.operatorName}.]</p>,
    },
    {
      id: "disclaimers",
      title: "Disclaimers",
      body: <p>[Service provided &quot;as is&quot;, without warranties of any kind.]</p>,
    },
    {
      id: "liability",
      title: "Limitation of liability",
      body: (
        <p>
          [Cap indirect/consequential damages and total liability to the extent permitted by law.]
        </p>
      ),
    },
    {
      id: "termination",
      title: "Termination",
      body: (
        <p>
          [Trainers can delete their profile from the dashboard at any time; we may suspend accounts
          that breach these terms.]
        </p>
      ),
    },
    {
      id: "governing-law",
      title: "Governing law",
      body: <p>[These terms are governed by the laws of {legalConfig.governingLaw}.]</p>,
    },
    {
      id: "changes",
      title: "Changes to these terms",
      body: <p>[How updates are posted and when they take effect.]</p>,
    },
    {
      id: "contact",
      title: "Contact",
      body: (
        <p>
          [{legalConfig.operatorName} — {legalConfig.contactEmail}]
        </p>
      ),
    },
  ],
};
