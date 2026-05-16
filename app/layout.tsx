import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Seoul Hostel Market Dashboard",
  description: "Personal AI-powered market dashboard for a Seoul hostel operator.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body>{children}</body>
    </html>
  );
}
