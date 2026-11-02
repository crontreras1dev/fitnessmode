import { legalConfig } from "@/lib/legal/config";
import type { LegalDocument } from "@/lib/legal/types";

export const privacyDoc: LegalDocument = {
  intro: (
    <p>
      FitnessMode is a free online directory where fitness trainers publish a public profile and
      visitors can browse and contact them directly. It is operated by {legalConfig.operatorName}.
      This policy explains what personal data we collect when you use the site, why we collect it,
      and the choices you have.
    </p>
  ),
  sections: [
    {
      id: "who-we-are",
      title: "Who we are",
      body: (
        <p>
          {legalConfig.operatorName} is the data controller for the personal data described in this
          policy (the &quot;responsable del tratamiento&quot; under Colombian law). You can reach us
          at <a href={`mailto:${legalConfig.contactEmail}`}>{legalConfig.contactEmail}</a> for any
          privacy question or request.
        </p>
      ),
    },
    {
      id: "data-we-collect",
      title: "Data we collect",
      body: (
        <>
          <p>We collect the following categories of data:</p>
          <ul>
            <li>
              <strong>Account data.</strong> When a trainer creates an account we store their email
              address to sign them in (via email magic link or Google OAuth).
            </li>
            <li>
              <strong>Profile content.</strong> The information trainers publish on their profile:
              display name, headline, bio, city or custom location, rates, categories, modalities
              and specialties, languages, education, avatar and gallery photos, and links to
              Instagram, TikTok or a personal website.
            </li>
            <li>
              <strong>Contact channels.</strong> WhatsApp and phone numbers are stored for all
              profiles but displayed publicly only on paid (Pro) profiles.
            </li>
            <li>
              <strong>Usage analytics.</strong> We record first-party view and click events on
              trainer profiles (event type, click target, referring host and timestamp) to power
              each trainer&apos;s stats dashboard. These events contain no IP addresses, no
              third-party trackers and no analytics cookies.
            </li>
            <li>
              <strong>On-device data.</strong> The favorites list is stored in the visitor&apos;s
              browser localStorage and never reaches our servers.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: "how-we-use-data",
      title: "How we use data",
      body: (
        <p>
          We use the data above to operate the directory, display trainer profiles publicly,
          authenticate trainer accounts, produce each trainer&apos;s stats dashboard, prevent abuse
          and spam, and operate, maintain and improve the service.
        </p>
      ),
    },
    {
      id: "legal-bases",
      title: "Legal bases",
      body: (
        <p>
          Where the law requires a legal basis (for example under the GDPR for EU/EEA visitors or
          Ley 1581 de 2012 in Colombia), we process data on the grounds of: performing the contract
          with trainers who create a profile; our legitimate interest in running, securing and
          improving the directory; and consent where applicable, which you may withdraw at any time.
        </p>
      ),
    },
    {
      id: "sharing",
      title: "Sharing and processors",
      body: (
        <>
          <p>We share data only with the services that process it on our behalf:</p>
          <ul>
            <li>Supabase — database, authentication and image storage</li>
            <li>Our hosting provider — serves the site and processes requests</li>
            <li>Google — optional OAuth sign-in for trainers</li>
            <li>
              Mapbox — optional city search geocoding, which receives the search text you type
            </li>
            <li>Email delivery provider — sends sign-in magic links</li>
          </ul>
          <p>
            We do not sell personal data, and we do not share it with advertisers or data brokers.
          </p>
        </>
      ),
    },
    {
      id: "international-transfers",
      title: "International transfers",
      body: (
        <p>
          Some of the providers above process data in countries other than your own, including the
          United States. Where required, these transfers rely on the safeguards offered by those
          providers (such as standard contractual clauses or equivalent mechanisms under their
          privacy programs).
        </p>
      ),
    },
    {
      id: "retention",
      title: "Retention",
      body: (
        <p>
          We keep account, profile and analytics data for as long as the profile or account is
          active and as needed for the purposes described above. When a trainer deletes their
          profile, the profile and its photos are removed; the underlying sign-in account may be
          retained for security, fraud-prevention or legal reasons. Aggregated statistics that can
          no longer identify a person may be kept indefinitely.
        </p>
      ),
    },
    {
      id: "your-rights",
      title: "Your rights",
      body: (
        <p>
          Depending on where you live, you may have rights to access, correct, delete or port your
          personal data, to object to or restrict processing, and to withdraw consent. In Colombia
          these include the rights of consultation, update, rectification, deletion and revocation
          under Ley 1581 de 2012. Trainers can edit or delete their profile directly from the
          dashboard; for anything else, email us at{" "}
          <a href={`mailto:${legalConfig.contactEmail}`}>{legalConfig.contactEmail}</a>.
        </p>
      ),
    },
    {
      id: "children",
      title: "Children",
      body: (
        <p>
          The service is not directed at children. You must be at least 18 years old to create an
          account, and we do not knowingly collect personal data from children. If you believe a
          child has provided us personal data, contact us and we will delete it.
        </p>
      ),
    },
    {
      id: "security",
      title: "Security",
      body: (
        <p>
          We use reasonable technical and organizational measures to protect personal data,
          including encryption in transit and restricted access to our systems. That said, no method
          of transmission or storage is completely secure, and we cannot guarantee absolute
          security.
        </p>
      ),
    },
    {
      id: "changes",
      title: "Changes to this policy",
      body: (
        <p>
          We may update this policy from time to time. Changes are posted on this page and take
          effect when published; the &quot;last updated&quot; date above shows the current version.
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
