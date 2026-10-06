---
title: Article template
description: A draft that shows how every Markdown element renders. Copy it to start a new article.
draft: true
---

This file is a draft, so it appears when you run `npm start` and never on the published site. To write a new article, copy it to `articles/YYYY-MM-DD-short-slug.md`, change the title and description, delete `draft: true` when it is ready, and push.

The date in the filename is the publish date. The rest of the filename becomes the address: this file would live at `/articles/article-template/`.

## A section heading

Paragraphs are plain text. Use **bold** for the one phrase a skimming reader must not miss, and *italics* sparingly. Links look like [this one to the homepage](/).

### A smaller heading

- Bullet lists get the same plus markers as the homepage.
- Keep each point to one idea.
- Three to five points read best.

1. Numbered lists are for real sequences.
2. Like the steps of a process.

> A pull quote or a client's words go in a block quote.

Inline code looks like `npm start`. Longer code goes in a fenced block:

```js
const invoices = await fetchUnpaid();
await Promise.all(invoices.map(sendReminder));
```

Every article ends with the same enquiry box, so you never need to write a call to action yourself.
