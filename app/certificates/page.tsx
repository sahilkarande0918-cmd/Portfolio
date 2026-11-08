import type { Metadata } from "next";
import { certificates, worlds } from "@/content/certificates";
import CertificateGallery from "@/components/CertificateGallery";

export const metadata: Metadata = {
  title: "Certificates",
  description: "Courses, internships and prizes — each with the original document.",
};

export default function Certificates() {
  const prizes = certificates.filter((c) => c.type === "Prize" || c.type === "Finalist").length;
  const internships = certificates.filter((c) => c.type === "Internship").length;
  return (
    <div className="roomv roomv--lines" style={{ "--door": "#2b3a3a" } as React.CSSProperties}>
      <div className="roomv__glow" aria-hidden="true" />
      <div className="wrap">
        <header className="intro">
          <p className="lbl">Room · Courses, internships & prizes</p>
          <h1>Certificates</h1>
          <p>Every certificate is hung on the line as it is, and opens to the full document. Courses are courses, participation is participation — each is labelled for what it is.</p>
          <span className="count">
            {certificates.length} documents · {prizes} prize & finalist · {internships} internships · scroll to walk the lines
          </span>
        </header>
      </div>
      <CertificateGallery worlds={worlds} />
    </div>
  );
}
