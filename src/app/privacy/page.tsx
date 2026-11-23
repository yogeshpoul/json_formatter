import type { Metadata } from "next";
import Link from "next/link";
import { ContentPage } from "@/components/content/ContentPage";
import { adsEnabled } from "@/config/ads";
import { siteConfig } from "@/config/site";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Privacy & Security – How Your JSON Stays on Your Device",
  description:
    "Learn how this browser-based JSON formatter keeps your data private: static hosting, no backend, no uploads, no JSON storage, and how to verify it yourself.",
  path: "/privacy",
});

export default function PrivacySecurityPage() {
  return (
    <ContentPage
      title="Privacy & Security"
      path="/privacy"
      lead={siteConfig.privacyStatement}
      updated={siteConfig.legalUpdated}
    >
      <h2>The short version</h2>
      <ul>
        <li>
          <strong>No uploads.</strong> JSON you paste, type or open is processed by JavaScript running in your browser tab.
          It is never included in a network request.
        </li>
        <li>
          <strong>No backend.</strong> The site is a set of static HTML, CSS and JavaScript files. There is no application
          server, API or database that could receive your data.
        </li>
        <li>
          <strong>No storage.</strong> Editor content is kept only in the memory of the open tab. It is not written to
          cookies, localStorage, sessionStorage or IndexedDB, and it is gone when you close or reload the page.
        </li>
        <li>
          <strong>No JSON analytics.</strong> We do not run analytics or session-recording tools that capture what you
          type into the editors.
        </li>
      </ul>

      <h2>How the architecture works</h2>
      <p>
        The website is built with Next.js and exported as static files at build time. When you open a page, your browser
        downloads those files from our hosting provider&apos;s content delivery network. From that point on, every tool works
        locally:
      </p>
      <ol>
        <li>
          <strong>Parsing and validation</strong> use a strict JSON parser written in TypeScript that runs in the page.
          Escaped strings are decoded with the browser&apos;s native <code>JSON.parse</code>.
        </li>
        <li>
          <strong>Large documents</strong> are handed to a Web Worker, a background thread inside your browser. The worker
          is created from a file on this site and can only exchange messages with the page that created it.
        </li>
        <li>
          <strong>Opening files</strong> uses the browser&apos;s File API. The file is read directly from your disk into
          memory and is not uploaded.
        </li>
        <li>
          <strong>Downloads</strong> are created in memory as a Blob and saved by your browser. No server generates them.
        </li>
        <li>
          <strong>Copy and paste</strong> use the browser&apos;s Clipboard API, which only works when you click a button.
        </li>
      </ol>

      <h2>Verify it yourself</h2>
      <p>You don&apos;t have to take our word for it. You can check it yourself in a few minutes:</p>
      <ol>
        <li>Open your browser&apos;s developer tools (F12, or Cmd + Option + I on a Mac) and switch to the Network tab.</li>
        <li>Paste some JSON, format it, convert it, and download the result.</li>
        <li>No request contains your JSON. You will see only page assets and, if enabled, advertising requests.</li>
      </ol>
      <p>
        You can also load the page, disconnect from the internet, and keep using every tool. Processing does not need a
        connection.
      </p>

      <h2>What we store on your device</h2>
      <p>
        If you switch between the light and dark theme, your choice (the word &quot;light&quot; or &quot;dark&quot;) is saved in
        localStorage so it is remembered next time. Nothing else is stored by this site.
      </p>

      <h2>Advertising and third-party scripts</h2>
      {adsEnabled ? (
        <p>
          This site is supported by Google AdSense. The AdSense script loads separately from the tools and receives only
          standard advertising information such as the page URL, your browser and device details, and cookie identifiers. Our
          code never passes editor content to it. Google may use cookies to serve and measure ads; see our{" "}
          <Link href="/privacy-policy">Privacy Policy</Link> for details and your choices.
        </p>
      ) : (
        <p>
          The site currently loads no third-party scripts. If advertising is enabled in the future, it will be provided by
          Google AdSense, and our code will never pass editor content to it. The <Link href="/privacy-policy">Privacy
          Policy</Link> will describe it.
        </p>
      )}
      <p>
        Like any script on a web page, third-party scripts technically run in the same page as the tools. That is why we keep
        them to a minimum, and why we never include ads inside the editor area. If you work with highly confidential data,
        you can use a content blocker or load the page and then go offline. The tools keep working.
      </p>

      <h2>Security measures</h2>
      <ul>
        <li>Pages are served only over HTTPS with HTTP Strict Transport Security (HSTS).</li>
        <li>Security headers prevent the site from being framed by other sites and stop browsers from guessing content types.</li>
        <li>Access to the camera, microphone and location is disabled by policy.</li>
        <li>Displayed JSON is rendered as text, never as HTML, so content you paste cannot run scripts on the page.</li>
        <li>We keep dependencies to a minimum to reduce supply-chain risk.</li>
      </ul>

      <h2>Limitations to be aware of</h2>
      <p>
        No website can promise perfect security, and we don&apos;t. Your data is only as safe as the device and browser you
        use. Browser extensions with permission to read pages can see what is on screen. Anything you copy is placed on your
        system clipboard. On shared computers, close the tab when you are finished.
      </p>

      <h2>Questions</h2>
      <p>
        See the <Link href="/privacy-policy">Privacy Policy</Link> for the full legal details, or <Link href="/contact">contact us</Link>.
        Please do not send us confidential JSON. We never need it to help you.
      </p>
    </ContentPage>
  );
}
