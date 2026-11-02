import { legalConfig } from "@/lib/legal/config";
import type { LegalDocument } from "@/lib/legal/types";

export const termsDoc: LegalDocument = {
  intro: (
    <p>
      These Terms govern your use of FitnessMode, a service operated by {legalConfig.operatorName}.
      By browsing the site or creating a profile, you agree to these Terms.
    </p>
  ),
  sections: [
    {
      id: "the-service",
      title: "The service",
      body: (
        <p>
          FitnessMode is a free directory where fitness trainers publish a public profile and
          visitors can browse and contact trainers directly. FitnessMode is not a party to any
          arrangement, booking or agreement between trainers and their clients.
        </p>
      ),
    },
    {
      id: "eligibility",
      title: "Eligibility",
      body: (
        <p>
          You must be at least 18 years old and legally capable of entering into these Terms.
          Trainers must have the right — and any qualifications, licenses or permits required in
          their jurisdiction — to offer the services described in their profile.
        </p>
      ),
    },
    {
      id: "accounts",
      title: "Accounts",
      body: (
        <p>
          Trainers sign in with an email magic link or their Google account. You are responsible for
          everything that happens under your account and for keeping your profile accurate and up to
          date.
        </p>
      ),
    },
    {
      id: "listings-moderation",
      title: "Listings and moderation",
      body: (
        <p>
          New profiles are reviewed before going live (they move from pending to active once
          approved). We may suspend or remove profiles that are inaccurate, inactive, spam, or that
          violate these Terms, at our discretion.
        </p>
      ),
    },
    {
      id: "your-content",
      title: "Content you submit",
      body: (
        <p>
          You keep ownership of the photos, bio, links and other content you submit. By posting them
          you grant us a non-exclusive, worldwide, royalty-free license to host, display and
          distribute them as part of the directory. You confirm that you have the right to post the
          content and that it does not infringe anyone else&apos;s rights.
        </p>
      ),
    },
    {
      id: "prohibited",
      title: "Prohibited content",
      body: (
        <p>
          You may not post unlawful, misleading, infringing or harmful content; create fake, scraped
          or duplicate listings; harass other users; scrape the directory; or misuse or interfere
          with the site&apos;s tracking and analytics endpoints.
        </p>
      ),
    },
    {
      id: "no-endorsement",
      title: "No vetting or endorsement",
      body: (
        <p>
          Profiles are self-reported by trainers. We do not verify credentials, certifications,
          insurance or background, and a listing is not an endorsement. Visitors deal with trainers
          at their own risk and should check qualifications independently before booking.
        </p>
      ),
    },
    {
      id: "dealings",
      title: "Dealings between users",
      body: (
        <p>
          Sessions, payments and communications are strictly between the client and the trainer. We
          take no commission and are not responsible for the quality, safety, legality or outcome of
          any service arranged through the directory.
        </p>
      ),
    },
    {
      id: "paid-features",
      title: "Free and paid features",
      body: (
        <p>
          Publishing a profile and browsing the directory are free. Optional paid features — such as
          displaying WhatsApp or call buttons, featured placement or a verified badge — may be
          offered under separate pricing and terms communicated at the time of purchase.
        </p>
      ),
    },
    {
      id: "intellectual-property",
      title: "Intellectual property",
      body: (
        <p>
          The site, the FitnessMode brand and the software behind it belong to{" "}
          {legalConfig.operatorName}. You may not copy, reproduce or reuse them except as needed to
          use the service as intended.
        </p>
      ),
    },
    {
      id: "disclaimers",
      title: "Disclaimers",
      body: (
        <p>
          The service is provided &quot;as is&quot; and &quot;as available&quot;, without warranties
          of any kind, express or implied, including warranties of merchantability, fitness for a
          particular purpose and non-infringement.
        </p>
      ),
    },
    {
      id: "liability",
      title: "Limitation of liability",
      body: (
        <p>
          To the maximum extent permitted by law, we are not liable for indirect, incidental,
          special or consequential damages, or for lost profits, data or goodwill. Our total
          liability for any claim relating to the service is limited to the amount you paid us in
          the twelve months before the claim, or USD 100 if you paid nothing.
        </p>
      ),
    },
    {
      id: "termination",
      title: "Termination",
      body: (
        <p>
          Trainers can delete their profile from the dashboard at any time. We may suspend or
          terminate accounts and remove listings that breach these Terms, with or without notice
          where appropriate.
        </p>
      ),
    },
    {
      id: "governing-law",
      title: "Governing law",
      body: (
        <p>
          These Terms are governed by the laws of {legalConfig.governingLaw}, without regard to
          conflict-of-law rules. Disputes will be resolved before the competent courts of Bogotá,
          Colombia, unless mandatory law provides otherwise.
        </p>
      ),
    },
    {
      id: "changes",
      title: "Changes to these terms",
      body: (
        <p>
          We may update these Terms from time to time. Changes are posted on this page and take
          effect when published; the &quot;last updated&quot; date above shows the current version.
          Continuing to use the service after a change means you accept the updated Terms.
        </p>
      ),
    },
    {
      id: "contact",
      title: "Contact",
      body: (
        <p>
          {legalConfig.operatorName} —{" "}
          <a href={`mailto:${legalConfig.contactEmail}`}>{legalConfig.contactEmail}</a>
        </p>
      ),
    },
  ],
};
