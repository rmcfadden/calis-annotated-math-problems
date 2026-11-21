# Annotated math problems

Static Vite + React site for photographed math problems, hosted on GitHub Pages.

## Develop

```bash
npm install
npm run dev
npm test
```

## Add a problem from a photo

Drop a file at `src/content/problems/<slug>/photo.jpg`. Optional `problem.mdx` adds a title, topic, hints, and widgets.

Or from a terminal:

```bash
npm run ingest -- path/to/IMG.jpg --topic algebra --title "Completing the square"
```

While `npm run dev` is running, open `/author` to capture or pick a photo. Then commit and push.

## Deploy

1. Push to `main`.
2. In the GitHub repo: **Settings → Pages → Source = GitHub Actions**.

The site is served at `https://<user>.github.io/calis-annotated-math-problems/`.
