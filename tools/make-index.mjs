// tools/make-index.mjs
import { promises as fs } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

// ここに除外したいフォルダ名を追加してOK
const IGNORE_DIRS = new Set([
  "node_modules",
  ".git",
  "dist",
  "build",
  ".next",
  ".vite",
  "coverage",
  ".turbo",
  "__MACOSX",
]);

// ここを指定すると、その配下だけ拾う（例: "exercises"）
// 使わないなら null のままでOK
const ONLY_UNDER = null;

function shouldIgnoreDir(dirName) {
  return IGNORE_DIRS.has(dirName);
}

async function walk(dirAbs, found = []) {
  const entries = await fs.readdir(dirAbs, { withFileTypes: true });

  for (const e of entries) {
    const abs = path.join(dirAbs, e.name);

    if (e.isDirectory()) {
      if (shouldIgnoreDir(e.name)) continue;
      await walk(abs, found);
      continue;
    }

    if (e.isFile() && e.name.toLowerCase().endsWith(".html")) {
      // 生成する index.html 自体は除外
      if (path.resolve(abs) === path.resolve(path.join(ROOT, "index.html"))) continue;
      found.push(abs);
    }
  }
  return found;
}

function toPosix(p) {
  return p.split(path.sep).join("/");
}

function escapeHtml(s) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function makeTitle(relPath) {
  // 表示名：フォルダ/ファイル をそのまま。好みで変えてOK
  return relPath.replace(/\/index\.html$/i, "/");
}

async function main() {
  let baseAbs = ROOT;
  if (ONLY_UNDER) baseAbs = path.join(ROOT, ONLY_UNDER);

  const htmlAbsList = await walk(baseAbs);
  const relList = htmlAbsList
    .map((abs) => toPosix(path.relative(ROOT, abs)))
    .filter((p) => p.toLowerCase() !== "index.html");

  // ルート直下の index.html はメニューにする想定なので、他の index.html も拾う
  // ただし好みでフィルタ可能：
  // .filter((p) => !p.toLowerCase().endsWith("/index.html"))

  // ソート：パス順
  relList.sort((a, b) => a.localeCompare(b, "ja"));

  // グルーピング（1階層目でまとめる）
  const groups = new Map();
  for (const rel of relList) {
    const top = rel.includes("/") ? rel.split("/")[0] : "(root)";
    if (!groups.has(top)) groups.set(top, []);
    groups.get(top).push(rel);
  }

  const groupKeys = Array.from(groups.keys()).sort((a, b) => a.localeCompare(b, "ja"));

  const sections = groupKeys
    .map((g) => {
      const items = groups.get(g)
        .map((rel) => {
          const href = "/" + rel; // Vite dev server想定（ルートからの絶対パス）
          const title = makeTitle(rel);
          return `<li><a href="${escapeHtml(href)}">${escapeHtml(title)}</a></li>`;
        })
        .join("\n");
      return `
<section class="group">
  <h2>${escapeHtml(g)}</h2>
  <ul>
    ${items}
  </ul>
</section>`;
    })
    .join("\n");

  const html = `<!doctype html>
<html lang="ja">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Hands-on Index</title>
  <style>
    body { font-family: system-ui, -apple-system, Segoe UI, sans-serif; margin: 24px; line-height: 1.5; }
    .meta { opacity: .75; margin-bottom: 16px; }
    .group { margin: 24px 0; padding: 16px; border: 1px solid #ddd; border-radius: 12px; }
    ul { margin: 0; padding-left: 18px; }
    li { margin: 6px 0; }
    a { text-decoration: none; }
    a:hover { text-decoration: underline; }
    code { background: #f6f6f6; padding: 2px 6px; border-radius: 6px; }
  </style>
</head>
<body>
  <h1>Hands-on Index</h1>
  <p class="meta">Generated: ${escapeHtml(new Date().toISOString())}</p>
  <p class="meta">Total: <code>${relList.length}</code> HTML files</p>
  ${sections || "<p>No HTML files found.</p>"}
</body>
</html>
`;

  await fs.writeFile(path.join(ROOT, "index.html"), html, "utf8");
  console.log(`✅ index.html generated. (${relList.length} links)`);
}

main().catch((err) => {
  console.error("❌ Failed:", err);
  process.exit(1);
});