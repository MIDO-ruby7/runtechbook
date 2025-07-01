import fs from "fs";
import path from "path";
import matter from "gray-matter";

interface Entry {
  path: string;
  title?: string;
}

const config = require("../vivliostyle.config.js") as { entry: Entry[] };
const outputPath = path.join(__dirname, "..", "common", "toc.md");

function generateTOC(entries: Entry[]) {
  const tocItems: string[] = [`1. **はじめに**\n`];
  let index = 2;

  // テーマごとの章タイトル設定（key: ディレクトリ名）
  const sectionTitles: Record<string, string> = {
    nest: "NEST",
    hub: "HUB",
    free: "自由",
  };

  // 章ごとに記事を分類
  const sections: Record<string, Entry[]> = {};
  for (const entry of entries) {
    if (entry.path.startsWith("common/")) continue;
    const dir = entry.path.split("/")[0]; // nest/37-midori.md → "nest"
    if (!sections[dir]) sections[dir] = [];
    sections[dir].push(entry);
  }

  // 章ごとに目次を出力
  for (const dir of Object.keys(sectionTitles)) {
    const entriesInSection = sections[dir];
    if (!entriesInSection) continue;

    tocItems.push(`\n## ${sectionTitles[dir]}`);

    for (const entry of entriesInSection) {
      const fullPath = path.join(__dirname, "..", entry.path);
      const raw = fs.readFileSync(fullPath, "utf-8");
      const parsed = matter(raw);

      const id = path.basename(entry.path, ".md");
      const title = parsed.data.title || entry.title || id;
      const author = parsed.data.author || "（著者未記入）";

      tocItems.push(`${index}. [${title}](#${id})  —  ${author}`);
      index++;
    }
  }

  tocItems.push(`\n${index}. **おわりに**`);
  tocItems.push(`${index + 1}. **奥付**`);

  const tocContent = `# 目次\n\n${tocItems.join("\n")}\n`;
  fs.writeFileSync(outputPath, tocContent, "utf-8");
  console.log("✅ toc.md を更新しました");
}

generateTOC(config.entry);

// bun tsx script/generate-toc.ts