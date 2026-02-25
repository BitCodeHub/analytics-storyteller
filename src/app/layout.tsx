import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Analytics Storyteller | AI-Powered Data Narratives",
  description: "Transform your data into compelling stories. Upload CSV files and let AI uncover insights, trends, and actionable recommendations.",
  keywords: ["analytics", "data visualization", "AI", "storytelling", "CSV analysis", "data insights"],
  authors: [{ name: "Lumen AI" }],
  openGraph: {
    title: "Analytics Storyteller",
    description: "Transform data into stories with AI",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
