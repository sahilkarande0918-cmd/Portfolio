import Link from "next/link";

export default function NotFound() {
  return (
    <div className="roomv">
      <div className="wrap intro">
        <p className="lbl">404</p>
        <h1>This door is locked.</h1>
        <p>The page you were looking for isn&apos;t here.</p>
        <Link className="pill pill--dark" href="/#work">
          Back to the doors
        </Link>
      </div>
    </div>
  );
}
