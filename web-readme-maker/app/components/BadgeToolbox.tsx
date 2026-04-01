"use client";

import { useMemo, useState } from "react";

type RepoRef = {
  owner: string;
  repo: string;
  url: string;
};

function parseRepoInput(input: string): RepoRef | null {
  const raw = input.trim();
  if (!raw) return null;

  // Accept: owner/repo
  const simple = raw.match(/^([\w.-]+)\/([\w.-]+)$/);
  if (simple) {
    const owner = simple[1];
    const repo = simple[2];
    return { owner, repo, url: `https://github.com/${owner}/${repo}` };
  }

  // Accept: https://github.com/owner/repo(.git)?(/...)
  try {
    const url = new URL(raw);
    if (url.hostname !== "github.com") return null;
    const parts = url.pathname.split("/").filter(Boolean);
    if (parts.length < 2) return null;
    const owner = parts[0];
    const repo = parts[1].replace(/\.git$/i, "");
    if (!owner || !repo) return null;
    return { owner, repo, url: `https://github.com/${owner}/${repo}` };
  } catch {
    return null;
  }
}

type Tool = {
  id: string;
  label: string;
  template: string;
  requires?: Array<"username" | "repo">;
  options?: {
    color?: {
      label: string;
      placeholder: string;
      values: string[];
      defaultValue: string;
    };
    colorInput?: {
      label: string;
      placeholder: string;
      defaultValue: string;
    };
    link?: {
      label: string;
      placeholder: string;
      defaultValue: string;
      inputPlaceholder: string;
    };
  };
};

function fillTemplate(
  template: string,
  args: { username: string; repo: RepoRef | null; context: "repo" | "profile" },
) {
  const profileUsername = args.username.trim();
  const repoOwner = args.repo?.owner ?? "USERNAME";
  const repoName = args.repo?.repo ?? "REPO-NAME";
  const repoUrl = args.repo?.url ?? "https://github.com/USERNAME/REPO-NAME";

  const usernameForTemplate = args.context === "repo" ? repoOwner : profileUsername || "USERNAME";
  return template
    .replaceAll("USERNAME", usernameForTemplate)
    .replaceAll("OWNER", repoOwner || "OWNER")
    .replaceAll("REPO-NAME", repoName || "REPO-NAME")
    .replaceAll("REPO-URL", repoUrl);
}

const COLOR_HEX_MAP: Record<string, string> = {
  pink: "ec4899",
  purple: "8b5cf6",
  yellow: "facc15",
  red: "ef4444",
  green: "22c55e",
  blue: "3b82f6",
  teal: "14b8a6",
  magenta: "c026d3",
  darkgreen: "065f46",
  lightgreen: "a3e635",
  orange: "f97316",
  violet: "7c3aed",
  blueviolet: "8A2BE2",
};

function applyToolOptions(template: string, selected: { color?: string; link?: string }, tool: Tool) {
  let out = template;
  const colorOpt = tool.options?.color;
  if (colorOpt) {
    const colorName = selected.color ?? colorOpt.defaultValue;
    const colorValue = COLOR_HEX_MAP[colorName] ?? colorName;
    out = out.replaceAll(colorOpt.placeholder, colorValue);
  }
  const colorInputOpt = tool.options?.colorInput;
  if (colorInputOpt) {
    const colorValue = selected.color ?? colorInputOpt.defaultValue;
    out = out.replaceAll(colorInputOpt.placeholder, colorValue.replace(/^#/, ""));
  }
  const linkOpt = tool.options?.link;
  if (linkOpt) {
    out = out.replaceAll(linkOpt.placeholder, selected.link?.trim() || linkOpt.defaultValue);
  }
  return out;
}

const COLOR_SWATCH_CLASSES: Record<string, string> = {
  pink: "bg-pink-500",
  purple: "bg-purple-600",
  yellow: "bg-yellow-400",
  red: "bg-red-500",
  green: "bg-green-500",
  blue: "bg-blue-500",
  teal: "bg-teal-500",
  magenta: "bg-fuchsia-600",
  darkgreen: "bg-emerald-800",
  lightgreen: "bg-lime-400",
  orange: "bg-orange-500",
  violet: "bg-violet-600",
  blueviolet: "bg-[#8A2BE2]",
};

const SECTION_DEFS: Array<{
  id: string;
  title: string;
  tools: Tool[];
}> = [
  {
    id: "repo-badges",
    title: "Repository Badges",
    tools: [
      {
        id: "license-mit",
        label: "License (MIT)",
        template:
          "[![License: MIT](https://img.shields.io/badge/License-MIT-COLOR.svg)](https://opensource.org/licenses/MIT)",
        options: {
          color: {
            label: "Color",
            placeholder: "COLOR",
            values: [
              "pink",
              "purple",
              "yellow",
              "red",
              "green",
              "blue",
              "teal",
              "magenta",
              "darkgreen",
              "lightgreen",
              "orange",
              "violet",
            ],
            defaultValue: "yellow",
          },
        },
      },
      {
        id: "stars",
        label: "Stars",
        template:
          "[![Stars](https://img.shields.io/github/stars/USERNAME/REPO-NAME)](https://github.com/USERNAME/REPO-NAME/stargazers)",
        requires: ["repo"],
      },
      {
        id: "forks",
        label: "Forks",
        template:
          "[![Forks](https://img.shields.io/github/forks/USERNAME/REPO-NAME)](https://github.com/USERNAME/REPO-NAME/network/members)",
        requires: ["repo"],
      },
      {
        id: "release",
        label: "Latest release",
        template:
          "[![GitHub release (latest by date)](https://img.shields.io/github/v/release/USERNAME/REPO-NAME)](https://github.com/USERNAME/REPO-NAME/releases)",
        requires: ["repo"],
      },
      {
        id: "top-language",
        label: "Top language",
        template:
          "[![Top Language](https://img.shields.io/github/languages/top/USERNAME/REPO-NAME)](https://github.com/USERNAME/REPO-NAME)",
        requires: ["repo"],
      },
      {
        id: "code-size",
        label: "Code size",
        template:
          "[![Code Size](https://img.shields.io/github/languages/code-size/USERNAME/REPO-NAME)](https://github.com/USERNAME/REPO-NAME)",
        requires: ["repo"],
      },
      {
        id: "last-commit",
        label: "Last commit",
        template:
          "[![Last Commit](https://img.shields.io/github/last-commit/USERNAME/REPO-NAME)](https://github.com/USERNAME/REPO-NAME/commits/main)",
        requires: ["repo"],
      },
      {
        id: "issues",
        label: "Issues",
        template:
          "[![Issues](https://img.shields.io/github/issues/USERNAME/REPO-NAME)](https://github.com/USERNAME/REPO-NAME/issues)",
        requires: ["repo"],
      },
      {
        id: "marketplace",
        label: "Marketplace badge example",
        template:
          "[![GitHub Marketplace](https://img.shields.io/badge/GitHub%20Marketplace-blue?logo=github)](MARKETPLACE-URL)",
        options: {
          link: {
            label: "Link",
            placeholder: "MARKETPLACE-URL",
            defaultValue: "https://github.com/marketplace",
            inputPlaceholder: "e.g. https://github.com/marketplace/actions/checkout",
          },
        },
      },
    ],
  },
  {
    id: "profile-badges",
    title: "Profile Badges",
    tools: [
      {
        id: "profile-views",
        label: "Profile Views",
        template:
          "[![Profile Views](https://komarev.com/ghpvc/?username=USERNAME&style=for-the-badge&color=COLOR)](https://github.com/USERNAME)",
        requires: ["username"],
        options: {
          colorInput: {
            label: "Color",
            placeholder: "COLOR",
            defaultValue: "8A2BE2",
          },
        },
      },
      {
        id: "followers",
        label: "Followers",
        template:
          "[![Followers](https://img.shields.io/github/followers/USERNAME?style=for-the-badge&color=COLOR)](https://github.com/USERNAME?tab=followers)",
        requires: ["username"],
        options: {
          colorInput: {
            label: "Color",
            placeholder: "COLOR",
            defaultValue: "8A2BE2",
          },
        },
      },
      {
        id: "stars",
        label: "Stars",
        template:
          "[![Stars](https://img.shields.io/github/stars/USERNAME?style=for-the-badge&color=COLOR)](https://github.com/USERNAME?tab=stars)",
        requires: ["username"],
        options: {
          colorInput: {
            label: "Color",
            placeholder: "COLOR",
            defaultValue: "8A2BE2",
          },
        },
      },
    ],
  },
  { id: "profile-stats", title: "Profile stats", tools: [] },
  { id: "profile-actions", title: "Profile Actions", tools: [] },
  { id: "tool-icons", title: "Tool Icons", tools: [] },
  { id: "aesthetic", title: "Asthetic Pieces", tools: [] },
];

export function BadgeToolbox(props: {
  open: boolean;
  onClose: () => void;
  onInsert: (snippet: string) => void;
}) {
  const [username, setUsername] = useState<string>("");
  const [repoInput, setRepoInput] = useState<string>("");
  const [toolOptionSelections, setToolOptionSelections] = useState<
    Record<string, { color?: string; link?: string }>
  >({});

  const repo = useMemo(() => parseRepoInput(repoInput), [repoInput]);
  const [activeSectionId, setActiveSectionId] = useState<string>(SECTION_DEFS[0]?.id ?? "repo-badges");

  const activeSection = useMemo(
    () => SECTION_DEFS.find((s) => s.id === activeSectionId) ?? SECTION_DEFS[0],
    [activeSectionId],
  );

  if (!props.open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[1px]"
        onClick={props.onClose}
        aria-hidden="true"
      />

      <div className="absolute left-1/2 top-1/2 w-[min(980px,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-950 shadow-2xl">
        <div className="flex items-start justify-between gap-4 px-5 sm:px-6 py-4 border-b border-zinc-200/80 dark:border-zinc-800/80">
          <div>
            <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Badge toolbox</div>
            <div className="text-xs text-zinc-600 dark:text-zinc-400">
              Click a tool to insert it at your cursor.
            </div>
          </div>
          <button
            type="button"
            onClick={props.onClose}
            className="rounded-lg border border-zinc-300 dark:border-zinc-700 px-2.5 py-1.5 text-xs font-medium text-zinc-800 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
          >
            Close
          </button>
        </div>

        <div className="p-5 sm:p-6 border-b border-zinc-200/80 dark:border-zinc-800/80">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="block">
              <div className="text-xs font-semibold tracking-wide text-zinc-500 dark:text-zinc-400 uppercase">
                GitHub username
              </div>
              <input
                className="mt-1 w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-zinc-300 dark:focus:ring-zinc-700"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. jojohuber"
              />
            </label>

            <label className="block">
              <div className="text-xs font-semibold tracking-wide text-zinc-500 dark:text-zinc-400 uppercase">
                Repository (URL or owner/repo)
              </div>
              <input
                className="mt-1 w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-zinc-300 dark:focus:ring-zinc-700"
                value={repoInput}
                onChange={(e) => setRepoInput(e.target.value)}
                placeholder="e.g. https://github.com/vercel/next.js"
              />
              <div className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-500">
                Parsed:{" "}
                <span className="font-mono">
                  {repo ? `${repo.owner}/${repo.repo}` : "—"}
                </span>
              </div>
            </label>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row">
          <aside className="sm:w-64 border-b sm:border-b-0 sm:border-r border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/60 dark:bg-zinc-950/40">
            <div className="p-3">
              {SECTION_DEFS.map((s) => {
                const active = s.id === activeSectionId;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setActiveSectionId(s.id)}
                    className={[
                      "w-full text-left rounded-xl px-3 py-2 text-sm transition-colors",
                      active
                        ? "bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 text-zinc-900 dark:text-zinc-50"
                        : "text-zinc-700 dark:text-zinc-200 hover:bg-white/60 dark:hover:bg-zinc-900/50",
                    ].join(" ")}
                  >
                    {s.title}
                    <span className="ml-2 text-[11px] text-zinc-500 dark:text-zinc-500">
                      ({s.tools.length})
                    </span>
                  </button>
                );
              })}
            </div>
          </aside>

          <section className="flex-1 p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                {activeSection?.title}
              </div>
              <div className="text-[11px] text-zinc-500 dark:text-zinc-500">
                Inserts as markdown
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
              {(activeSection?.tools ?? []).map((tool) => {
                const needsRepo = tool.requires?.includes("repo") ?? false;
                const disabled = needsRepo && !repo;
                const context: "repo" | "profile" = activeSectionId === "repo-badges" ? "repo" : "profile";
                const base = fillTemplate(tool.template, { username, repo, context });
                const selection = toolOptionSelections[tool.id] ?? {};
                const snippet = applyToolOptions(base, selection, tool);

                return (
                  <div
                    key={tool.id}
                    role="button"
                    tabIndex={disabled ? -1 : 0}
                    aria-disabled={disabled}
                    onClick={() => {
                      if (disabled) return;
                      props.onInsert(snippet);
                    }}
                    onKeyDown={(e) => {
                      if (disabled) return;
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        props.onInsert(snippet);
                      }
                    }}
                    className={[
                      "rounded-2xl border px-4 py-3 text-left transition-colors",
                      disabled
                        ? "border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/30 text-zinc-400 cursor-not-allowed"
                        : "border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-950 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-900 dark:text-zinc-50",
                    ].join(" ")}
                  >
                    <div className="text-sm font-semibold">{tool.label}</div>

                    {tool.options?.color ? (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {tool.options.color.values.map((value) => {
                          const selected = (selection.color ?? tool.options?.color?.defaultValue) === value;
                          const swatchClass = COLOR_SWATCH_CLASSES[value] ?? "bg-zinc-400";
                          return (
                            <button
                              key={value}
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setToolOptionSelections((prev) => ({
                                  ...prev,
                                  [tool.id]: { ...(prev[tool.id] ?? {}), color: value },
                                }));
                              }}
                              aria-label={`Set ${tool.label} color to ${value}`}
                              className={[
                                "h-6 w-6 rounded-md border transition-colors",
                                swatchClass,
                                selected
                                  ? "border-zinc-900 dark:border-zinc-50 ring-2 ring-zinc-900/20 dark:ring-zinc-50/20"
                                  : "border-zinc-200/80 dark:border-zinc-800/80 hover:border-zinc-400 dark:hover:border-zinc-600",
                              ].join(" ")}
                            />
                          );
                        })}
                      </div>
                    ) : null}

                    {tool.options?.colorInput ? (
                      <div className="mt-2">
                        <div className="flex items-center gap-2">
                          <div
                            className="h-6 w-6 rounded-md border border-zinc-200/80 dark:border-zinc-800/80"
                            style={{
                              backgroundColor: `#${
                                (selection.color ?? tool.options.colorInput.defaultValue).replace(
                                  /^#/,
                                  "",
                                )
                              }`,
                            }}
                          />
                          <input
                            className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white/70 dark:bg-zinc-900/70 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-zinc-300 dark:focus:ring-zinc-700"
                            value={selection.color ?? tool.options.colorInput.defaultValue}
                            onClick={(e) => e.stopPropagation()}
                            onKeyDown={(e) => e.stopPropagation()}
                            onChange={(e) => {
                              const next = e.target.value;
                              setToolOptionSelections((prev) => ({
                                ...prev,
                                [tool.id]: { ...(prev[tool.id] ?? {}), color: next },
                              }));
                            }}
                            placeholder="e.g. 8A2BE2"
                          />
                        </div>
                      </div>
                    ) : null}

                    {tool.options?.link ? (
                      <div className="mt-2">
                        <input
                          className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white/70 dark:bg-zinc-900/70 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-zinc-300 dark:focus:ring-zinc-700"
                          value={selection.link ?? tool.options.link.defaultValue}
                          onClick={(e) => e.stopPropagation()}
                          onKeyDown={(e) => e.stopPropagation()}
                          onChange={(e) => {
                            const next = e.target.value;
                            setToolOptionSelections((prev) => ({
                              ...prev,
                              [tool.id]: { ...(prev[tool.id] ?? {}), link: next },
                            }));
                          }}
                          placeholder={tool.options.link.inputPlaceholder}
                        />
                      </div>
                    ) : null}

                    <div className="mt-2 text-[11px] text-zinc-600 dark:text-zinc-400 font-mono break-all">
                      {snippet}
                    </div>
                    {disabled ? (
                      <div className="mt-2 text-[11px] text-zinc-500">Add a repo to enable.</div>
                    ) : null}
                  </div>
                );
              })}
            </div>

            {(activeSection?.tools?.length ?? 0) === 0 ? (
              <div className="mt-6 rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-800 p-4 text-sm text-zinc-600 dark:text-zinc-400">
                Tools for this section are coming next.
              </div>
            ) : null}
          </section>
        </div>
      </div>
    </div>
  );
}
