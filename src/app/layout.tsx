import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Product Search Platform",
    template: "%s | Product Search Platform"
  },
  description: "Fast, intuitive, and powerful CSV-based product search with advanced analytics. Built with Next.js, TypeScript, and modern web technologies.",
  keywords: ["product search", "CSV analysis", "data visualization", "Next.js", "TypeScript", "analytics"],
  authors: [{ name: "Product Search Platform Team" }],
  creator: "Product Search Platform",
  publisher: "Product Search Platform",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://product-search-platform.vercel.app",
    title: "Product Search Platform",
    description: "Fast, intuitive, and powerful CSV-based product search with advanced analytics",
    siteName: "Product Search Platform",
  },
  twitter: {
    card: "summary_large_image",
    title: "Product Search Platform",
    description: "Fast, intuitive, and powerful CSV-based product search with advanced analytics",
    creator: "@productsearch",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${poppins.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
