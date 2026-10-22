import { readdirSync, readFileSync, statSync } from "node:fs";
import { extname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const rootPath = fileURLToPath(new URL("./src/", import.meta.url));

const forbidden = [
  { pattern: /from\s+["']react(?:\/[^"']*)?["']/, reason: "React import" },
  { pattern: /from\s+["']react-dom(?:\/[^"']*)?["']/, reason: "React DOM import" },
  { pattern: /from\s+["']perry(?:\/[^"']*)?["']/, reason: "Perry import" },
  { pattern: /\bwindow\b/, reason: "window global" },
  { pattern: /\bdocument\b/, reason: "document global" },
  { pattern: /\blocalStorage\b/, reason: "browser storage" },
  { pattern: /\bnavigator\b/, reason: "navigator global" },
  { pattern: /\bHTMLElement\b/, reason: "DOM type" },
  { pattern: /\bAndroid\b/, reason: "Android-specific symbol" },
];

function files(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? files(path) : [path];
  });
}

const violations = [];

for (const path of files(rootPath)) {
  if (![".ts", ".js"].includes(extname(path))) continue;
  const source = readFileSync(path, "utf8");
  for (const rule of forbidden) {
    if (rule.pattern.test(source)) {
      violations.push(
        `${relative(rootPath, path)}: ${rule.reason} is forbidden in presentation schema`,
      );
    }
  }
}

if (violations.length > 0) {
  console.error(violations.join("\n"));
  process.exit(1);
}

console.log("presentation boundary: renderer/runtime independent");
