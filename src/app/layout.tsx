import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Multiprogrammed batch",
  description: "Operating systems batch simulator",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="min-h-dvh font-sans text-foreground antialiased">{children}</body>
    </html>
  );
}
