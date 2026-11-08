import type { Metadata, Viewport } from "next";
import { Onest } from "next/font/google";
import { site } from "@/content/site";
import Header from "@/components/Header";
import ThemeCord from "@/components/ThemeCord";
import ContactDialog from "@/components/ContactDialog";
import SmoothScroll from "@/components/SmoothScroll";
import Footer from "@/components/Footer";
import "lenis/dist/lenis.css";
import "./globals.css";
import "./pages.css";
import "./light.css";

const onest = Onest({ subsets: ["latin"], variable: "--font-onest", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.title, template: `%s — ${site.name}` },
  description: site.description,
  authors: [{ name: site.name, url: site.github }],
  // every page names its is-a.dev address as the original, so the vercel.app copy isn't indexed twice
  alternates: { canonical: "./" },
  openGraph: { type: "profile", siteName: site.name, title: site.title, description: site.description, locale: "en_IN" },
  twitter: { card: "summary_large_image", title: site.title, description: site.description },
};

export const viewport: Viewport = {
  themeColor: "#1a1818",
};

// runs before first paint so the saved mode never flashes (dark until the cord is pulled), and picks the
// lite profile for modest devices: the same site, with the heaviest per-frame effects eased off
const modeScript = `try{var m=localStorage.getItem('mode');if(m!=='light')m='dark';document.documentElement.dataset.mode=m}catch(e){document.documentElement.dataset.mode='dark'}try{var n=navigator;if(matchMedia('(pointer: coarse)').matches||(n.hardwareConcurrency||8)<=4||(n.deviceMemory||8)<=4||(n.connection&&n.connection.saveData))document.documentElement.classList.add('lite')}catch(e){}requestAnimationFrame(function(){document.documentElement.classList.add('ready')})`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={onest.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: modeScript }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({ "@context": "https://schema.org", "@type": "Person", name: site.name, url: site.url, sameAs: [site.github, site.linkedin] }),
          }}
        />
      </head>
      <body>
        <a className="skip" href="#main">
          Skip to content
        </a>
        <SmoothScroll />
        <Header />
        <ThemeCord />
        <main id="main">{children}</main>
        <Footer />
        <ContactDialog />
      </body>
    </html>
  );
}
