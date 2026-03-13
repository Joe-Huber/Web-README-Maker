"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";

const DEFAULT_MARKDOWN = `# My Awesome Project

Short description of what this project does and who it's for.

## Features
- Fast, simple README editing
- Live preview as you type
- Future: badge toolbox for pretty repo stats

## Installation
\`\`\`bash
npm install
npm run dev
\`\`\`

## Usage
Describe how to use your project here.
`;

export default function Home() {
  const [markdown, setMarkdown] = useState<string>(DEFAULT_MARKDOWN);

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-black flex items-center justify-center px-4 py-8">
      <main className="w-full max-w-6xl bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-200/80 dark:border-zinc-800/80 overflow-hidden flex flex-col">
        <header className="px-6 sm:px-8 py-4 border-b border-zinc-200/80 dark:border-zinc-800/80 flex items-center justify-between gap-3 bg-zinc-50/80 dark:bg-zinc-950/40 backdrop-blur">
          <div>
            <h1 className="text-lg sm:text-xl font-semibold text-zinc-900 dark:text-zinc-50">
              README Web Maker
            </h1>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
              Type markdown on the left, see your README render live on the right.
            </p>
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full border border-zinc-300 dark:border-zinc-700 bg-white/70 dark:bg-zinc-900/70 px-3 py-1.5 text-xs sm:text-sm font-medium text-zinc-800 dark:text-zinc-100 shadow-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            {/* Placeholder for future badge toolbox trigger */}
            Badge toolbox (soon)
          </button>
        </header>

        <section className="flex-1 flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-zinc-200 dark:divide-zinc-800">
          {/* Editor side */}
          <div className="w-full lg:w-1/2 flex flex-col">
            <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-950/40">
              <span className="text-xs font-semibold tracking-wide text-zinc-500 dark:text-zinc-400 uppercase">
                Markdown
              </span>
              <span className="text-[11px] text-zinc-500 dark:text-zinc-500">
                Raw README.md content
              </span>
            </div>
            <textarea
              className="flex-1 resize-none bg-transparent px-4 sm:px-6 py-4 text-sm sm:text-[15px] leading-relaxed font-mono text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus-visible:outline-none"
              value={markdown}
              onChange={(event) => setMarkdown(event.target.value)}
              spellCheck={false}
            />
          </div>

          {/* Preview side */}
          <div className="w-full lg:w-1/2 flex flex-col bg-zinc-50/60 dark:bg-zinc-950/40">
            <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-zinc-200 dark:border-zinc-800">
              <span className="text-xs font-semibold tracking-wide text-zinc-500 dark:text-zinc-400 uppercase">
                Preview
              </span>
              <span className="text-[11px] text-zinc-500 dark:text-zinc-500">
                Rendered README
              </span>
            </div>
            <div className="flex-1 overflow-auto px-4 sm:px-6 py-4 text-sm sm:text-[15px] leading-relaxed text-zinc-900 dark:text-zinc-50 markdown-body">
              <ReactMarkdown>{markdown}</ReactMarkdown>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
