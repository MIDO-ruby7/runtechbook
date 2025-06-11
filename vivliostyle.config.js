const entries = require('./entries/entries');

module.exports = {
  title: 'RUN-NEST Hub',
  author: 'test',
  langage: 'ja',
  size: 'B5',
  entry: [
    { path: 'common/toc.md', title: '目次', theme: './theme/base.css' },
    { path: 'common/preface.md', title: 'はじめに', theme: './theme/base.css' },
    ...entries,
    { path: 'common/postface.md', title: 'おわりに', theme: './theme/base.css' },
    { path: 'common/colophon.md', title: '奥付け', theme: './theme/base.css' },
  ],
  toc: true,
  vfm: {
    hardLineBreaks: true,
    disableFormatHtml: false, // ← HTML変換を無効にしない
    partialYaml: false,
    formatHtml: true, // ← HTML変換を有効にする
  },
};
