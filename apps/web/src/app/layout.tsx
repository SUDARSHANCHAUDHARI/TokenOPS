import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TokenOps — AI Cost Optimization Engine",
  description:
    "Control your AI costs. Reduce token usage. Maximize output.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
