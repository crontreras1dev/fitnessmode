import { legalConfig } from "@/lib/legal/config";
import type { LegalDocument } from "@/lib/legal/types";

export const cookiesDoc: LegalDocument = {
  intro: (
    <p>
      [Opening paragraph: how FitnessMode uses cookies and similar storage. The site only uses
      strictly-necessary cookies, so no consent banner is required.]
    </p>
  ),
  sections: [
    {
      id: "cookies-we-use",
      title: "Cookies we use",
      body: (
        <>
          <p>[Describe each cookie. The app actually sets:]</p>
          <ul>
            <li>
              [Authentication session cookie (Supabase) — keeps signed-in trainers logged in.
              Strictly necessary.]
            </li>
            <li>
              [Locale cookie — remembers whether you browse in English or Spanish. Strictly
              necessary.]
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
          [The favorites list is stored in your browser&apos;s localStorage. It stays on your device
          and is never sent to our servers.]
        </p>
      ),
    },
    {
      id: "no-tracking",
      title: "No tracking cookies",
      body: (
        <p>
          [We do not use advertising or third-party analytics cookies. Profile view/click statistics
          are recorded first-party and contain no IP address.]
        </p>
      ),
    },
    {
      id: "managing",
      title: "Managing cookies",
      body: (
        <p>
          [How to block or delete cookies in your browser, and that sign-in will stop working
          without the session cookie.]
        </p>
      ),
    },
    {
      id: "changes",
      title: "Changes to this notice",
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
