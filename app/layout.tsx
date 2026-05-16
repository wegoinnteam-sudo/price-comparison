import type { Metadata } from "next";
import { ChatbotWidget } from "@/components/dashboard/chatbot-widget";
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
      <body>
        {children}
        <ChatbotWidget />
      </body>
    </html>
  );
}
