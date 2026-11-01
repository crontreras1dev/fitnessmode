import Link from "next/link";

export default function NotFound() {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif", padding: "4rem", textAlign: "center" }}>
        <h1>Page not found</h1>
        <p>
          <Link href="/">Back to home</Link>
        </p>
      </body>
    </html>
  );
}
