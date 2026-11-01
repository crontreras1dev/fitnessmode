// Passthrough root layout: <html>/<body> live in [locale]/layout.tsx, and this
// file only exists so the global not-found.tsx has a layout.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
