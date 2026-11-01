import Link from "next/link";

export default function NotFound() {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif", padding: "4rem", textAlign: "center" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/logo.png"
          alt="FitnessMode"
          style={{ height: "40px", marginBottom: "1.5rem" }}
        />
        <h1>Page not found</h1>
        <p>
          <Link href="/">Back to home</Link>
        </p>
      </body>
    </html>
  );
}
