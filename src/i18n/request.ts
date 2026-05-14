import { getRequestConfig } from "next-intl/server";

import de from "../messages/de.json";
import en from "../messages/en.json";
import es from "../messages/es.json";
import { routing } from "./routing";

const messagesByLocale = {
  es,
  en,
  de,
} as const;

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;
  if (!locale || !routing.locales.includes(locale as "es" | "en" | "de")) {
    locale = routing.defaultLocale;
  }

  const messages = messagesByLocale[locale as keyof typeof messagesByLocale];

  return {
    locale,
    messages,
  };
});
