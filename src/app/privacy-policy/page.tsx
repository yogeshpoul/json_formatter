import type { Metadata } from "next";
import Link from "next/link";
import { ContentPage } from "@/components/content/ContentPage";
import { siteConfig } from "@/config/site";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: `Privacy Policy | ${siteConfig.name}`,
  description: `Privacy policy for ${siteConfig.name}. What information is and is not collected, how advertising cookies work, and your choices.`,
  path: "/privacy-policy",
});

export default function PrivacyPolicyPage() {
  return (
    <ContentPage title="Privacy Policy" path="/privacy-policy" updated={siteConfig.legalUpdated}>
      <p>
        This policy explains what information is handled when you use {siteConfig.name} (the &quot;site&quot;). For a
        technical explanation of how the tools keep your JSON on your device, see{" "}
        <Link href="/privacy">Privacy &amp; Security</Link>.
      </p>

      <h2>Content you enter into the tools</h2>
      <p>
        JSON and other text that you paste, type or open in the tools is processed entirely in your web browser. We do not
        receive, transmit, store, log or sell it. It is not saved in cookies or browser storage and is discarded when you
        close or reload the page.
      </p>

      <h2>Information we do not collect</h2>
      <p>
        The site has no user accounts, sign-up forms or newsletters. We do not ask for your name, email address or any other
        personal details to use the tools.
      </p>

      <h2>Hosting and server logs</h2>
      <p>
        The site is hosted on Vercel. When your browser requests pages and files, the hosting provider automatically
        processes technical data such as your IP address, browser user agent, the requested URL and the time of the request.
        This is needed to deliver the site, protect it against abuse and diagnose errors. These logs do not contain the
        content you enter into the tools. See{" "}
        <a href="https://vercel.com/legal/privacy-policy" rel="noopener noreferrer" target="_blank">
          Vercel&apos;s privacy policy
        </a>{" "}
        for details.
      </p>

      <h2>Cookies and local storage</h2>
      <p>
        The site itself stores only your theme preference (&quot;light&quot; or &quot;dark&quot;) in your browser&apos;s
        localStorage. It sets no cookies of its own.
      </p>

      <h2>Advertising</h2>
      <p>
        We may display ads served by Google AdSense to keep the tools free. When ads are enabled:
      </p>
      <ul>
        <li>
          Third-party vendors, including Google, use cookies to serve ads based on your prior visits to this and other
          websites.
        </li>
        <li>
          Google&apos;s use of advertising cookies enables it and its partners to serve ads based on your visits to this site
          and other sites on the internet.
        </li>
        <li>
          You can opt out of personalised advertising in{" "}
          <a href="https://adssettings.google.com" rel="noopener noreferrer" target="_blank">
            Google Ads Settings
          </a>
          , or opt out of some third-party vendors&apos; use of cookies at{" "}
          <a href="https://www.aboutads.info/choices/" rel="noopener noreferrer" target="_blank">
            aboutads.info
          </a>
          .
        </li>
        <li>
          Learn more in{" "}
          <a href="https://policies.google.com/technologies/partner-sites" rel="noopener noreferrer" target="_blank">
            How Google uses information from sites or apps that use its services
          </a>
          .
        </li>
      </ul>
      <p>
        Visitors in the European Economic Area, the United Kingdom and Switzerland will be asked for consent through a
        Google-certified consent management platform before personalised ads or advertising cookies are used. You can change
        your choice at any time using the privacy settings link shown by the consent message.
      </p>
      <p>The advertising script never receives the content you enter into the tools.</p>

      <h2>Analytics</h2>
      <p>We do not use analytics or session-recording tools that capture the content of the editors.</p>

      <h2>Your rights</h2>
      <p>
        Depending on where you live, you may have rights to access, correct, delete or object to the processing of personal
        data. Because we do not collect personal data through the tools, there is usually nothing for us to provide. For data
        processed by Google for advertising, use the Google controls linked above.
      </p>

      <h2>Children</h2>
      <p>The site is intended for developers and is not directed at children under 13.</p>

      <h2>Changes to this policy</h2>
      <p>We may update this policy as the site changes. The date at the top of the page shows when it was last revised.</p>

      <h2>Contact</h2>
      <p>
        For privacy questions, please use the details on our <Link href="/contact">contact page</Link>.
      </p>
    </ContentPage>
  );
}
