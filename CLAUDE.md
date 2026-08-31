Sweet 16 sites
==============
Three sibling repos share the [Sweet 16][sweet-16] Jekyll theme (a port of the
Wordpress Twenty Sixteen theme, GPL):

| Repo | Path | What it is |
| ---- | ---- | ---------- |
| `sweet-16` | `../sweet-16` | the theme, upstream reference |
| `jdh8.org` | `../jdh8.org` | English blog, Taipei Forcing Club |
| `jdh8.com` | `../jdh8.com` | Chinese blog, 梅花雀莊 |

**This repo:** English site (Taipei Forcing Club, jdh8.org). Content lives in `_posts`, `_data`, `assets`, `tools`.

Working across the three
------------------------
There is no submodule or gem — the theme files are duplicated by hand.  So
**any theme or program change usually applies to all three repos**: `_layouts`,
`_includes`, `_sass`, `style`, `load.js`, `search.js`, `loader.css`,
`reveal.js`, `search/`, `404.md`.  Make the change in every repo, and use the
same commit title in each (`git log --oneline` across the three should line
up).

Content, config, and per-site tweaks do not propagate.  A few files have
deliberately drifted (CJK typography in `jdh8.com`, `.monospace` in
`jdh8.org`); check with `diff` before copying wholesale.

Build
-----
`bundle exec jekyll serve`.  The sites deploy via GitHub Actions
(`.github/workflows/pages.yml`), not legacy GitHub Pages, because the latter
silently ignores `jekyll-archives`.

[sweet-16]: https://github.com/jdh8/sweet-16
