import { legalConfig } from "@/lib/legal/config";
import type { LegalDocument } from "@/lib/legal/types";

export const cookiesDoc: LegalDocument = {
  intro: (
    <p>
      This notice explains how FitnessMode uses cookies and similar browser storage. We only use
      strictly-necessary cookies — the site works without advertising or third-party analytics
      cookies — so no consent banner is required.
    </p>
  ),
  sections: [
    {
      id: "cookies-we-use",
      title: "Cookies we use",
      body: (
        <>
          <p>The site sets only these cookies:</p>
          <ul>
            <li>
              <strong>Authentication session cookie.</strong> Set by Supabase when a trainer signs
              in; it keeps the session active across pages. Strictly necessary — signing in does
              not work without it.
            </li>
            <li>
              <strong>Locale cookie.</strong> Remembers whether you browse in English or Spanish so
              we can show the site in your language. Strictly necessary for your preference.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: "local-storage",
      title: "Browser storage",
      body: (
        <p>
          Your favorites list is stored in your browser&apos;s localStorage. It stays on your
          device, is never sent to our servers, and you can clear it at any time through your
          browser settings.
        </p>
      ),
    },
    {
      id: "no-tracking",
      title: "No tracking cookies",
      body: (
        <p>
          We do not use advertising cookies, social-media trackers or third-party analytics
          cookies. The view and click statistics shown on trainer profiles are recorded
          first-party and contain no IP address.
        </p>
      ),
    },
    {
      id: "managing",
      title: "Managing cookies",
      body: (
        <p>
          You can block or delete cookies through your browser&apos;s settings. Keep in mind that
          blocking the session cookie will prevent trainers from signing in, and blocking the
          locale cookie means the language preference won&apos;t be remembered.
        </p>
      ),
    },
    {
      id: "changes",
      title: "Changes to this notice",
      body: (
        <p>
          We may update this notice from time to time. Changes are posted on this page and take
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
