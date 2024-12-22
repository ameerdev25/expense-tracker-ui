import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "Expense Tracker",
  description: "Expenses Management Application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full w-full">
      <body className="h-full w-full bg-blue-100 antialiased" >
          <Providers>{children}</Providers>           
      </body>
    </html>
  );
}
