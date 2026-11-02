"use client";

import { useEffect } from "react";
import Link from "next/link";

const copy = {
  en: {
    title: "Something went wrong",
    body: "We hit an unexpected error. Please try again.",
    tryAgain: "Try again",
    backHome: "Back to home",
  },
  es: {
    title: "Algo salió mal",
    body: "Ocurrió un error inesperado. Inténtalo de nuevo.",
    tryAgain: "Intentar de nuevo",
    backHome: "Volver al inicio",
  },
};

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const lang =
    typeof window !== "undefined" && window.location.pathname.startsWith("/es") ? "es" : "en";
  const t = copy[lang];

  return (
    <html lang={lang}>
      <body
        style={{
          fontFamily: "system-ui, sans-serif",
          padding: "4rem",
          textAlign: "center",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/logo.png"
          alt="FitnessMode"
          style={{ height: "40px", marginBottom: "1.5rem" }}
        />
        <h1>{t.title}</h1>
        <p>{t.body}</p>
        <p>
          <button
            onClick={reset}
            style={{
              font: "inherit",
              padding: "0.6rem 1.2rem",
              marginRight: "1rem",
              borderRadius: "0.75rem",
              border: "1px solid #ccc",
              cursor: "pointer",
            }}
          >
            {t.tryAgain}
          </button>
          <Link href="/">{t.backHome}</Link>
        </p>
      </body>
    </html>
  );
}
