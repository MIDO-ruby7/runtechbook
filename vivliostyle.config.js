const nest = require('./nest/nest');
const hub = require('./hub/hub');
const free = require('./free/free');

module.exports = {
  title: 'RUN-NEST Hub',
  author: 'test',
  langage: 'ja',
  size: 'B5',
  entry: [
    { path: 'common/toc.md', title: '目次', theme: './styles/toc.css' },
    { path: 'common/preface.md', title: 'はじめに', theme: './styles/base.css' },
    { path: 'common/preface2.md', title: 'はじめに', theme: './styles/base.css' },
    ...nest,
    ...hub,
    ...free,
    { path: 'common/postface.md', title: 'おわりに', theme: './styles/base.css' },
    { path: 'common/colophon.md', title: '奥付け', theme: './styles/base.css' },
  ],
  toc: false,
  vfm: {
    hardLineBreaks: true,
    disableFormatHtml: false, // HTML変換を無効にしない
    partialYaml: false,
    formatHtml: true, // HTML変換を有効にする
  },
};
