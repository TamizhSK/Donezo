import type { Metadata } from "next";
import "./globals.css";


export const metadata: Metadata = {
  title: "Donezo",
  description: "A simple todo app built with Next.js",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className=""style={{ fontFamily: 'SF Pro Display, sans-serif' }}>
        {children}
      </body>
    </html>
  );
}