import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AppHeader } from "@/components/layout/AppHeader";
import { DocumentLang } from "@/components/providers/DocumentLang";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { SimulationEngine } from "@/components/simulation/SimulationEngine";
import { TooltipProvider } from "@/components/ui/tooltip";
import { routing } from "@/i18n/routing";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

function resolveMetadataBase(): URL {
  const raw = process.env.VERCEL_URL?.trim();
  if (!raw) {
    return new URL("http://localhost:3000");
  }
  if (raw.startsWith("http://") || raw.startsWith("https://")) {
    try {
      return new URL(raw);
    } catch {
      return new URL("http://localhost:3000");
    }
  }
  try {
    return new URL(`https://${raw}`);
  } catch {
    return new URL("http://localhost:3000");
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });

  return {
    metadataBase: resolveMetadataBase(),
    title: t("title"),
    description: t("description"),
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <ThemeProvider>
        <TooltipProvider delayDuration={280}>
          <SimulationEngine />
          <DocumentLang locale={locale} />
          <div className="flex min-h-dvh w-full flex-col bg-background">
            <AppHeader />
            <main className="mx-auto w-full max-w-[min(100%,1680px)] flex-1 px-3 py-4 sm:px-4 sm:py-5">{children}</main>
          </div>
        </TooltipProvider>
      </ThemeProvider>
    </NextIntlClientProvider>
  );
}
