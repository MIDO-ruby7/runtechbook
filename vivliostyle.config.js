const entries = require('./entries/entries');

module.exports = {
  title: 'RUN-NEST Hub',
  author: 'test',
  langage: 'ja',
  size: 'B5',
  entry: [
    { path: 'common/toc.md', title: '目次', theme: './custom_themes/base.css' },
    { path: 'common/preface.md', title: 'はじめに', theme: './custom_themes/base.css' },
    ...entries,
    { path: 'common/postface.md', title: 'おわりに', theme: './custom_themes/base.css' },
    { path: 'common/colophon.md', title: '奥付け', theme: './custom_themes/base.css' },
  ],
  toc: false,
  vfm: {
    hardLineBreaks: true,
    disableFormatHtml: false, // ← HTML変換を無効にしない
    partialYaml: false,
    formatHtml: true, // ← HTML変換を有効にする
  },
};
