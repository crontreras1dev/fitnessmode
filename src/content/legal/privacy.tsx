import { legalConfig } from "@/lib/legal/config";
import type { LegalDocument } from "@/lib/legal/types";

export const privacyDoc: LegalDocument = {
  intro: (
    <p>
      [Opening paragraph: what FitnessMode is, who operates it ({legalConfig.operatorName}), and
      that this policy explains what data is collected and why.]
    </p>
  ),
  sections: [
    {
      id: "who-we-are",
      title: "Who we are",
      body: (
        <p>
          [Identify the operator ({legalConfig.operatorName}) as the data controller, and how to
          reach them ({legalConfig.contactEmail}).]
        </p>
      ),
    },
    {
      id: "data-we-collect",
      title: "Data we collect",
      body: (
        <>
          <p>[Describe each category. The app actually collects:]</p>
          <ul>
            <li>
              [Account data — trainer email address for sign-in (magic link or Google OAuth).]
            </li>
            <li>
              [Profile content — display name, headline, bio, city or custom location, rates,
              categories/modalities/specialties, languages, education, avatar and gallery photos,
              Instagram/TikTok/website links.]
            </li>
            <li>
              [Contact channels — WhatsApp and phone numbers are stored for all profiles but
              displayed publicly only on paid (Pro) profiles.]
            </li>
            <li>
              [Usage analytics — first-party view/click events on trainer profiles (event type,
              click target, referring host, timestamp). No IP addresses, no third-party trackers, no
              analytics cookies.]
            </li>
            <li>
              [On-device data — the favorites list is stored in the visitor&apos;s browser
              localStorage and never reaches our servers.]
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
          [Purposes: run the directory, display trainer profiles, authenticate accounts, produce the
          per-trainer stats dashboard, prevent abuse, and operate/improve the service.]
        </p>
      ),
    },
    {
      id: "legal-bases",
      title: "Legal bases",
      body: (
        <p>
          [If you serve EU/EEA visitors: contract performance, legitimate interest, and consent
          where applicable.]
        </p>
      ),
    },
    {
      id: "sharing",
      title: "Sharing and processors",
      body: (
        <>
          <p>[List the services that process data on your behalf:]</p>
          <ul>
            <li>[Supabase — database, authentication, image storage]</li>
            <li>[Hosting provider (e.g. Vercel) — serves the site]</li>
            <li>[Google — optional OAuth sign-in]</li>
            <li>[Mapbox — optional city search geocoding (receives search text)]</li>
            <li>[Email delivery provider — sends magic links]</li>
          </ul>
          <p>[State that you do not sell personal data.]</p>
        </>
      ),
    },
    {
      id: "international-transfers",
      title: "International transfers",
      body: (
        <p>
          [Where data may be processed outside the visitor&apos;s country and which safeguards
          apply.]
        </p>
      ),
    },
    {
      id: "retention",
      title: "Retention",
      body: (
        <p>
          [How long account, profile and analytics data is kept, including what happens after
          profile deletion (profile and photos are deleted; the sign-in account may be retained).]
        </p>
      ),
    },
    {
      id: "your-rights",
      title: "Your rights",
      body: (
        <p>
          [Access, correction, deletion, portability, objection — note that trainers can edit or
          delete their profile from the dashboard, and other requests go to{" "}
          {legalConfig.contactEmail}.]
        </p>
      ),
    },
    {
      id: "children",
      title: "Children",
      body: <p>[The service is not directed at children; state the minimum age.]</p>,
    },
    {
      id: "security",
      title: "Security",
      body: (
        <p>
          [Brief statement on measures (encryption in transit, access controls) and that no system
          is perfectly secure.]
        </p>
      ),
    },
    {
      id: "changes",
      title: "Changes to this policy",
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
