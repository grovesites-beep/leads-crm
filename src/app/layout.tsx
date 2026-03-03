import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { createAdminClient } from "@/lib/appwrite/server";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700", "900"],
  variable: "--font-roboto",
});

export async function generateMetadata() {
  try {
    const { getDatabases } = await createAdminClient();
    const settings = await getDatabases().getDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      process.env.NEXT_PUBLIC_APPWRITE_SYSTEM_COLLECTION_ID!,
      'global'
    );
    return {
      title: settings.appName || "Grove Leads CRM",
      description: "Gerenciamento inteligente de Leads e Conversões.",
    };
  } catch (e) {
    return {
      title: "Grove Leads CRM",
      description: "Gerenciamento inteligente de Leads e Conversões.",
    };
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { getDatabases } = await createAdminClient();
  let primaryColor = "#000000";
  try {
    const settings = await getDatabases().getDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      process.env.NEXT_PUBLIC_APPWRITE_SYSTEM_COLLECTION_ID!,
      'global'
    );
    if (settings.primaryColor) {
      primaryColor = settings.primaryColor;
    }
  } catch (e) { }

  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <style dangerouslySetInnerHTML={{
          __html: `
                    :root {
                        --primary: ${primaryColor} !important;
                        --sidebar-primary: ${primaryColor} !important;
                        --ring: ${primaryColor} !important;
                    }
                    .dark {
                        --primary: ${primaryColor} !important;
                        --sidebar-primary: ${primaryColor} !important;
                        --ring: ${primaryColor} !important;
                    }
                `}} />
      </head>
      <body
        className={`${roboto.variable} font-sans antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
