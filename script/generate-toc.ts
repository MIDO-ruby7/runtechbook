import fs from "fs";
import path from "path";
import matter from "gray-matter";

interface Entry {
  path: string;
  title?: string;
}

const config = require("../vivliostyle.config.js") as { entry: Entry[] };

// 出力先
const outputPath = path.join(__dirname, "..", "common", "toc.md");

function generateTOC(entries: Entry[]) {
  const tocItems: string[] = [
    `1. **はじめに**`,
  ];

  let index = 2; // 目次番号の初期値を2に設定（「はじめに」が1番目）

  for (const entry of entries) {
    if (entry.path.startsWith("common/")) continue;

    const fullPath = path.join(__dirname, "..", entry.path);
    const raw = fs.readFileSync(fullPath, "utf-8");
    const parsed = matter(raw);

    const id = path.basename(entry.path, ".md"); // ex: 01-nakano
    const title = parsed.data.title || entry.title || id;
    const author = parsed.data.author || "（著者未記入）";

    tocItems.push(
      `${index}. [${title}](#${id})  —  ${author}`
    );

    index++;
  }

  tocItems.push(
    `${index}. **おわりに**`,
    `${index + 1}. **奥付**`
  );

  const tocContent = `# 目次

${tocItems.join("\n")}

`;

  fs.writeFileSync(outputPath, tocContent, "utf-8");
  console.log("✅ toc.md を更新しました");
}

// 実行
generateTOC(config.entry);

// bun tsx script/generate-toc.ts