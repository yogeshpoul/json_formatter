import type { Metadata } from "next";
import Link from "next/link";
import { ContentPage } from "@/components/content/ContentPage";
import { siteConfig } from "@/config/site";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: `Terms and Conditions | ${siteConfig.name}`,
  description: `Terms and conditions for using the free, browser-based JSON tools provided by ${siteConfig.name}.`,
  path: "/terms",
});

export default function TermsPage() {
  return (
    <ContentPage title="Terms and Conditions" path="/terms" updated={siteConfig.legalUpdated}>
      <p>
        By using {siteConfig.name} (the &quot;site&quot;) you agree to these terms. If you do not agree, please do not use
        the site.
      </p>

      <h2>1. The service</h2>
      <p>
        The site provides free tools for formatting, validating, viewing and converting JSON. The tools run in your web
        browser. We may add, change or remove tools at any time.
      </p>

      <h2>2. Your content</h2>
      <p>
        You keep all rights to the data you process with the tools. Because processing happens on your device, we do not
        receive or store your content. You are responsible for making sure you are allowed to process the data you use with
        the tools.
      </p>

      <h2>3. Acceptable use</h2>
      <p>You agree not to:</p>
      <ul>
        <li>use the site in a way that breaks any applicable law;</li>
        <li>attempt to disrupt, overload or gain unauthorised access to the site or its hosting infrastructure;</li>
        <li>use automated means to scrape or mirror the site in a way that places an unreasonable load on it;</li>
        <li>interfere with the advertising displayed on the site, for example by generating invalid clicks.</li>
      </ul>

      <h2>4. No warranty</h2>
      <p>
        The tools are provided &quot;as is&quot; and &quot;as available&quot; without warranties of any kind, express or
        implied, including fitness for a particular purpose and non-infringement. We work hard to make the tools accurate, but
        we do not guarantee that results will be error-free. Please review output before relying on it in production systems.
      </p>

      <h2>5. Limitation of liability</h2>
      <p>
        To the fullest extent permitted by law, we are not liable for any indirect, incidental, special or consequential
        damages, or for any loss of data, profits or business, arising from your use of the site.
      </p>

      <h2>6. Intellectual property</h2>
      <p>
        The site&apos;s design, text, logo and code are protected by copyright. You may use the tools freely, including for
        commercial work, but you may not copy or redistribute the site itself without permission.
      </p>

      <h2>7. Third-party services</h2>
      <p>
        The site may display ads provided by Google AdSense and may link to third-party websites. We are not responsible for
        their content or practices. See our <Link href="/privacy-policy">Privacy Policy</Link> for how advertising works.
      </p>

      <h2>8. Changes</h2>
      <p>
        We may update these terms from time to time. Continued use of the site after changes take effect means you accept the
        revised terms.
      </p>

      <h2>9. Contact</h2>
      <p>
        Questions about these terms? Visit our <Link href="/contact">contact page</Link>.
      </p>
    </ContentPage>
  );
}
