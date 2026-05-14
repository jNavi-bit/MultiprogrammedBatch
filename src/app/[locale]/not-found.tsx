"use client";

import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";

export default function NotFound() {
  const t = useTranslations("notFound");

  return (
    <div className="mx-auto max-w-md space-y-4 py-16 text-center">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">{t("title")}</h1>
      <p className="text-sm text-muted-foreground">{t("description")}</p>
      <Link
        href="/"
        className="inline-flex h-10 items-center justify-center rounded-2xl bg-foreground px-5 text-sm font-medium text-background hover:opacity-90"
      >
        {t("back")}
      </Link>
    </div>
  );
}
