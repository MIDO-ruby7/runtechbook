import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

interface Entry {
  path: string;
  title?: string;
}

const config = require('../vivliostyle.config.js') as { entry: Entry[] };

// 出力先
const outputPath = path.join(__dirname, '..', 'common', 'toc.md');

function generateTOC(entries: Entry[]) {
  const tocItems: string[] = [
    `<li><a href="#preface">はじめに</a></li>`
  ];

  for (const entry of entries) {
    if (entry.path.startsWith('common/')) continue;

    const fullPath = path.join(__dirname, '..', 'entries', entry.path);
    const raw = fs.readFileSync(fullPath, 'utf-8');
    const parsed = matter(raw);

    const id = path.basename(entry.path, '.md'); // ex: 01-nakano
    const title = parsed.data.title || entry.title || id;

    tocItems.push(`<li><a href="#${id}">${title}</a></li>`);
  }

  tocItems.push(
    `<li><a href="#postface">おわりに</a></li>`,
    `<li><a href="#colophon">奥付</a></li>`
  );

  const tocContent = `<nav role="doc-toc">
  <h2>目次</h2>
  <ol>
    ${tocItems.join('\n    ')}
  </ol>
</nav>
`;

  fs.writeFileSync(outputPath, tocContent, 'utf-8');
  console.log('✅ toc.md を更新しました');
}

// 実行
generateTOC(config.entry);
