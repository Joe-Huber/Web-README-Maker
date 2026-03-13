## README Web Maker

A small web app for drafting and previewing `README.md` files side‑by‑side.

### Features

- **Split view**: Markdown editor on the left, rendered preview on the right.
- **Live preview**: As you type in the editor, the preview updates in real time.
- **Badge‑ready layout**: Header already has a placeholder button for a future badge toolbox.

### Tech Stack

- **Framework**: Next.js (App Router)
- **UI**: Tailwind CSS (via `@tailwindcss/postcss`)
- **Markdown rendering**: `react-markdown`

### Getting Started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Then open `http://localhost:3000` in your browser.

### How to Use

- Type or paste your README markdown into the **Markdown** panel on the left.
- See the formatted result instantly in the **Preview** panel on the right.
- The sample content gives you a starting point for a typical project README.

### Next Steps / Ideas

- Add a **badge toolbox** that can insert prebuilt markdown snippets at the cursor.
- Export helpers (copy to clipboard, download as `.md`, etc.).
- Theming options for different README styles.
