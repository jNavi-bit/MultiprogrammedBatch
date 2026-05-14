import { copyFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const outDir = join(process.cwd(), "out");
const locale = process.env.GH_PAGES_DEFAULT_LOCALE?.trim() || "es";
const src = join(outDir, locale, "index.html");
const dest = join(outDir, "index.html");

if (!existsSync(src)) {
  console.error(`prepare-gh-pages: missing ${src} (run STATIC_EXPORT=1 next build first)`);
  process.exit(1);
}

copyFileSync(src, dest);
console.log(`prepare-gh-pages: wrote ${dest} from ${locale}/index.html`);
