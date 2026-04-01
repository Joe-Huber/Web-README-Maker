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
    theme?: {
      label: string;
      placeholder: string;
      values: string[];
      defaultValue: string;
    };
  };
  workflow?: string; // Added workflow property
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

function applyToolOptions(
  template: string,
  selected: { color?: string; link?: string; theme?: string },
  tool: Tool,
) {
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
  const themeOpt = tool.options?.theme;
  if (themeOpt) {
    out = out.replaceAll(themeOpt.placeholder, selected.theme ?? themeOpt.defaultValue);
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

const THEMES = [
  "default",
  "transparent",
  "shadow_red",
  "shadow_green",
  "shadow_blue",
  "dark",
  "radical",
  "merko",
  "gruvbox",
  "gruvbox_light",
  "tokyonight",
  "onedark",
  "cobalt",
  "synthwave",
  "highcontrast",
  "dracula",
  "prussian",
  "monokai",
  "vue",
  "vue-dark",
  "shades-of-purple",
  "nightowl",
  "buefy",
  "blue-green",
  "algolia",
  "great-gatsby",
  "darcula",
  "bear",
  "solarized-dark",
  "solarized-light",
  "chartreuse-dark",
  "nord",
  "gotham",
  "material-palenight",
  "graywhite",
  "vision-friendly-dark",
  "ayu-mirage",
  "midnight-purple",
  "calm",
  "flag-india",
  "omni",
  "react",
  "jolly",
  "maroongold",
  "yeblu",
  "blueberry",
  "slateorange",
  "kacho_ga",
  "outrun",
  "ocean_dark",
  "city_lights",
  "github_dark",
  "github_dark_dimmed",
  "discord_old_blurple",
  "aura_dark",
  "panda",
  "noctis_minimus",
  "cobalt2",
  "swift",
  "aura",
  "apprentice",
  "moltack",
  "codeSTACKr",
  "rose_pine",
  "catppuccin_latte",
  "catppuccin_mocha",
  "date_night",
  "one_dark_pro",
  "rose",
  "holi",
  "neon",
  "blue_navy",
  "calm_pink",
  "ambient_gradient",
];

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
        id: "contributors",
        label: "Contributors",
        template:
          "[![Contributors](https://img.shields.io/github/contributors/USERNAME/REPO-NAME)](https://github.com/USERNAME/REPO-NAME/graphs/contributors)",
        requires: ["repo"],
      },
      {
        id: "pull-requests",
        label: "Pull Requests",
        template:
          "[![Pull Requests](https://img.shields.io/github/issues-pr/USERNAME/REPO-NAME)](https://github.com/USERNAME/REPO-NAME/pulls)",
        requires: ["repo"],
      },
      {
        id: "closed-pull-requests",
        label: "Closed Pull Requests",
        template:
          "[![Closed Pull Requests](https://img.shields.io/github/issues-pr-closed/USERNAME/REPO-NAME)](https://github.com/USERNAME/REPO-NAME/pulls?q=is%3Apr+is%3Aclosed)",
        requires: ["repo"],
      },
      {
        id: "downloads",
        label: "Downloads",
        template:
          "[![Downloads](https://img.shields.io/github/downloads/USERNAME/REPO-NAME/total)](https://github.com/USERNAME/REPO-NAME/releases)",
        requires: ["repo"],
      },
      {
        id: "repo-size",
        label: "Repo Size",
        template:
          "[![Repo Size](https://img.shields.io/github/repo-size/USERNAME/REPO-NAME)](https://github.com/USERNAME/REPO-NAME)",
        requires: ["repo"],
      },
      {
        id: "watchers",
        label: "Watchers",
        template:
          "[![Watchers](https://img.shields.io/github/watchers/USERNAME/REPO-NAME)](https://github.com/USERNAME/REPO-NAME/watchers)",
        requires: ["repo"],
      },
      {
        id: "license",
        label: "License",
        template:
          "[![License](https://img.shields.io/github/license/USERNAME/REPO-NAME)](https://github.com/USERNAME/REPO-NAME/blob/main/LICENSE)",
        requires: ["repo"],
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
      {
        id: "twitter",
        label: "Twitter",
        template:
          "[![Twitter](https://img.shields.io/badge/Twitter-1DA1F2?style=for-the-badge&logo=twitter&logoColor=white)](https://twitter.com/USERNAME)",
        requires: ["username"],
      },
      {
        id: "linkedin",
        label: "LinkedIn",
        template:
          "[![LinkedIn](https://img.shields.io/badge/LinkedIn-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/USERNAME/)",
        requires: ["username"],
      },
      {
        id: "youtube",
        label: "YouTube",
        template:
          "[![YouTube](https://img.shields.io/badge/YouTube-FF0000?style=for-the-badge&logo=youtube&logoColor=white)](https://www.youtube.com/c/USERNAME)",
        requires: ["username"],
      },
      {
        id: "instagram",
        label: "Instagram",
        template:
          "[![Instagram](https://img.shields.io/badge/Instagram-E4405F?style=for-the-badge&logo=instagram&logoColor=white)](https://www.instagram.com/USERNAME/)",
        requires: ["username"],
      },
      {
        id: "facebook",
        label: "Facebook",
        template:
          "[![Facebook](https://img.shields.io/badge/Facebook-1877F2?style=for-the-badge&logo=facebook&logoColor=white)](https://www.facebook.com/USERNAME/)",
        requires: ["username"],
      },
      {
        id: "sponsor",
        label: "Sponsor",
        template:
          "[![Sponsor](https://img.shields.io/badge/Sponsor-30363D?style=for-the-badge&logo=GitHub-Sponsors&logoColor=white)](https://github.com/sponsors/USERNAME)",
        requires: ["username"],
      },
    ],
  },
  {
    id: "profile-stats",
    title: "Profile stats",
    tools: [
      {
        id: "github-stats",
        label: "GitHub Stats",
        template: "![GitHub Stats](https://github-stats-extended.vercel.app/api?username=USERNAME&theme=THEME)",
        requires: ["username"],
        options: {
          theme: {
            label: "Theme",
            placeholder: "THEME",
            values: [...new Set(THEMES)],
            defaultValue: "buefy",
          },
        },
      },
      {
        id: "top-langs",
        label: "Top Languages",
        template:
          "![Top Languages](https://github-stats-extended.vercel.app/api/top-langs/?username=USERNAME&layout=compact&theme=THEME)",
        requires: ["username"],
        options: {
          theme: {
            label: "Theme",
            placeholder: "THEME",
            values: [...new Set(THEMES)],
            defaultValue: "buefy",
          },
        },
      },
      {
        id: "streak-stats",
        label: "Streak Stats",
        template: "![Streak Stats](https://streak-stats.demolab.com/?user=USERNAME&theme=THEME)",
        requires: ["username"],
        options: {
          theme: {
            label: "Theme",
            placeholder: "THEME",
            values: [...new Set(THEMES)],
            defaultValue: "buefy",
          },
        },
      },
      {
        id: "profile-trophy",
        label: "Profile Trophy",
        template:
          "![Profile Trophy](https://github-profile-trophy-tawny.vercel.app/?username=USERNAME&theme=THEME&no-frame=true&row=1&margin-w=12)",
        requires: ["username"],
        options: {
          theme: {
            label: "Theme",
            placeholder: "THEME",
            values: [...new Set([
              "flat",
              "buddhism",
              "onedark",
              "gruvbox",
              "nord",
              "xcode",
              "dracula",
              "monokai",
              "chalk",
              "radical",
              "merko",
              "tokyonight",
              "synthwave",
              "highcontrast",
            ])],
            defaultValue: "flat",
          },
        },
      },
      {
        id: "activity-graph",
        label: "Activity Graph",
        template:
          "![Activity Graph](https://github-readme-activity-graph.vercel.app/graph?username=USERNAME&theme=THEME&custom_title=Contribution%20Graph)",
        requires: ["username"],
        options: {
          theme: {
            label: "Theme",
            placeholder: "THEME",
            values: [...new Set([
              "github",
              "github-compact",
              "react",
              "react-dark",
              "github-dark",
              "gotham",
              "rogue",
              "xcode",
              "redical",
              "merko",
              "gruvbox",
              "gruvbox-light",
              "tokyonight",
              "onedark",
              "synthwave",
              "highcontrast",
              "dracula",
              "prussian",
              "monokai",
              "vue",
              "vue-dark",
              "shades-of-purple",
              "nightowl",
              "buefy",
              "blue-green",
              "algolia",
              "great-gatsby",
              "darcula",
              "bear",
              "solarized-dark",
              "solarized-light",
              "chartreuse-dark",
              "nord",
              "material-palenight",
              "graywhite",
              "vision-friendly-dark",
              "ayu-mirage",
              "midnight-purple",
              "calm",
              "flag-india",
              "omni",
              "jolly",
              "maroongold",
              "yeblu",
              "blueberry",
              "slateorange",
              "kacho_ga",
              "outrun",
              "ocean_dark",
              "city_lights",
              "github_dark_dimmed",
              "discord_old_blurple",
              "aura_dark",
              "panda",
              "noctis_minimus",
              "cobalt2",
              "swift",
              "aura",
              "apprentice",
              "moltack",
              "codeSTACKr",
              "rose_pine",
              "catppuccin_latte",
              "catppuccin_mocha",
              "date_night",
              "one_dark_pro",
              "rose",
              "holi",
              "neon",
              "blue_navy",
              "calm_pink",
              "ambient_gradient",
            ])],
            defaultValue: "github-compact",
          },
        },
      },
    ],
  },
  {
    id: "profile-actions",
    title: "Profile Actions",
    tools: [
      {
        id: "top-followers",
        label: "Top Followers",
        template: "<!-- FOLLOWERS_LIST_START -->\n<!-- FOLLOWERS_LIST_END -->",
        requires: ["username"],
        workflow: `name: Update README with Top Followers

on:
  schedule:
    - cron: '0 0 * * *' # Runs daily at midnight
  workflow_dispatch:

jobs:
  update-readme:
    runs-on: ubuntu-latest
    permissions:
      contents: write # Required to push changes back to the repository
    steps:
      - name: Check out repository
        uses: actions/checkout@v3

      - name: Update README with most followed followers
        uses: Joe-Huber/my-most-followed-followers@main # Or use a specific version like @v1
        with:
          GITHUB_USER_NAME: \${{ github.repository_owner }}
          MAX_FOLLOWER_COUNT: 10 # Optional: specify the number of followers to show

      - name: Commit and push changes
        run: |
          git config --global user.name 'github-actions[bot]'
          git config --global user.email 'github-actions[bot]@users.noreply.github.com'
          git add README.md
          git commit -m "Automated README update" || exit 0
          git push`,
      },
      {
        id: "generate-snake",
        label: "Generate Snake",
        template: "<!--START_SECTION:activity-->\n<!--END_SECTION:activity-->",
        requires: ["username"],
        workflow: `name: Generate Snake

on:
  schedule:
    - cron: "0 0 * * *"
  workflow_dispatch:

jobs:
  build:
    permissions:
      contents: write
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: Platane/snk@v3
        with:
          github_user_name: \${{ github.repository_owner }}
          outputs: |
            dist/github-contribution-grid-snake.svg?color_snake=black&color_dots=#E6E6FA,#D8BFD8,#BA55D3,#9932CC,#4B0082
            dist/github-contribution-grid-snake-dark.svg?palette=github-dark&color_snake=white&color_dots=#4B0082,#8A2BE2,#9932CC,#BA55D3,#DDA0DD
      - uses: crazy-max/ghaction-github-pages@v2.1.3
        with:
          target_branch: output
          build_dir: dist
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}`,
      },
    ],
  },
  {
    id: "tool-icons",
    title: "Tool Icons",
    tools: [
      // Languages
      {
        id: "python",
        label: "Python",
        template: "![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)",
      },
      {
        id: "javascript",
        label: "JavaScript",
        template: "![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)",
      },
      {
        id: "typescript",
        label: "TypeScript",
        template: "![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)",
      },
      {
        id: "java",
        label: "Java",
        template: "![Java](https://img.shields.io/badge/Java-007396?style=for-the-badge&logo=java&logoColor=white)",
      },
      {
        id: "cplusplus",
        label: "C++",
        template: "![C++](https://img.shields.io/badge/C%2B%2B-00599C?style=for-the-badge&logo=c%2B%2B&logoColor=white)",
      },
      {
        id: "go",
        label: "Go",
        template: "![Go](https://img.shields.io/badge/Go-00ADD8?style=for-the-badge&logo=go&logoColor=white)",
      },
      {
        id: "rust",
        label: "Rust",
        template: "![Rust](https://img.shields.io/badge/Rust-000000?style=for-the-badge&logo=rust&logoColor=white)",
      },
      {
        id: "php",
        label: "PHP",
        template: "![PHP](https://img.shields.io/badge/PHP-777BB4?style=for-the-badge&logo=php&logoColor=white)",
      },
      {
        id: "ruby",
        label: "Ruby",
        template: "![Ruby](https://img.shields.io/badge/Ruby-CC342D?style=for-the-badge&logo=ruby&logoColor=white)",
      },
      {
        id: "csharp",
        label: "C#",
        template: "![C#](https://img.shields.io/badge/C%23-239120?style=for-the-badge&logo=c-sharp&logoColor=white)",
      },
      // Frontend Frameworks/Libraries
      {
        id: "react",
        label: "React",
        template: "![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)",
      },
      {
        id: "angular",
        label: "Angular",
        template: "![Angular](https://img.shields.io/badge/Angular-DD0031?style=for-the-badge&logo=angular&logoColor=white)",
      },
      {
        id: "vuejs",
        label: "Vue.js",
        template: "![Vue.js](https://img.shields.io/badge/Vue.js-4FC08D?style=for-the-badge&logo=vue.js&logoColor=white)",
      },
      {
        id: "nextjs",
        label: "Next.js",
        template: "![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)",
      },
      // Backend Frameworks/Libraries
      {
        id: "nodejs",
        label: "Node.js",
        template: "![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)",
      },
      {
        id: "spring",
        label: "Spring",
        template: "![Spring](https://img.shields.io/badge/Spring-6DB33F?style=for-the-badge&logo=spring&logoColor=white)",
      },
      {
        id: "django",
        label: "Django",
        template: "![Django](https://img.shields.io/badge/Django-092E20?style=for-the-badge&logo=django&logoColor=white)",
      },
      {
        id: "flask",
        label: "Flask",
        template: "![Flask](https://img.shields.io/badge/Flask-000000?style=for-the-badge&logo=flask&logoColor=white)",
      },
      {
        id: "dotnet",
        label: ".NET",
        template: "![.NET](https://img.shields.io/badge/.NET-512BD4?style=for-the-badge&logo=dotnet&logoColor=white)",
      },
      {
        id: "laravel",
        label: "Laravel",
        template: "![Laravel](https://img.shields.io/badge/Laravel-FF2D20?style=for-the-badge&logo=laravel&logoColor=white)",
      },
      {
        id: "rubyonrails",
        label: "Ruby on Rails",
        template: "![Ruby on Rails](https://img.shields.io/badge/Ruby_on_Rails-CC0000?style=for-the-badge&logo=ruby-on-rails&logoColor=white)",
      },
      // Databases
      {
        id: "postgresql",
        label: "PostgreSQL",
        template: "![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)",
      },
      {
        id: "mysql",
        label: "MySQL",
        template: "![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)",
      },
      {
        id: "mongodb",
        label: "MongoDB",
        template: "![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)",
      },
      {
        id: "sqlite",
        label: "SQLite",
        template: "![SQLite](https://img.shields.io/badge/SQLite-07405E?style=for-the-badge&logo=sqlite&logoColor=white)",
      },
      {
        id: "redis",
        label: "Redis",
        template: "![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)",
      },
      // Cloud Platforms
      {
        id: "aws",
        label: "AWS",
        template: "![AWS](https://img.shields.io/badge/AWS-232F3E?style=for-the-badge&logo=amazon-aws&logoColor=white)",
      },
      {
        id: "azure",
        label: "Azure",
        template: "![Azure](https://img.shields.io/badge/Azure-0078D4?style=for-the-badge&logo=microsoft-azure&logoColor=white)",
      },
      {
        id: "googlecloud",
        label: "Google Cloud",
        template: "![Google Cloud](https://img.shields.io/badge/Google_Cloud-4285F4?style=for-the-badge&logo=google-cloud&logoColor=white)",
      },
      // DevOps & Tools
      {
        id: "docker",
        label: "Docker",
        template: "![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)",
      },
      {
        id: "kubernetes",
        label: "Kubernetes",
        template: "![Kubernetes](https://img.shields.io/badge/Kubernetes-326CE5?style=for-the-badge&logo=kubernetes&logoColor=white)",
      },
      {
        id: "git",
        label: "Git",
        template: "![Git](https://img.shields.io/badge/Git-F05032?style=for-the-badge&logo=git&logoColor=white)",
      },
      {
        id: "github",
        label: "GitHub",
        template: "![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)",
      },
      {
        id: "gitlab",
        label: "GitLab",
        template: "![GitLab](https://img.shields.io/badge/GitLab-FCA121?style=for-the-badge&logo=gitlab&logoColor=white)",
      },
      {
        id: "jenkins",
        label: "Jenkins",
        template: "![Jenkins](https://img.shields.io/badge/Jenkins-D24939?style=for-the-badge&logo=jenkins&logoColor=white)",
      },
      {
        id: "vscode",
        label: "VS Code",
        template: "![VS Code](https://img.shields.io/badge/VS_Code-007ACC?style=for-the-badge&logo=visual-studio-code&logoColor=white)",
      },
      {
        id: "figma",
        label: "Figma",
        template: "![Figma](https://img.shields.io/badge/Figma-F24E1E?style=for-the-badge&logo=figma&logoColor=white)",
      },
      {
        id: "jira",
        label: "Jira",
        template: "![Jira](https://img.shields.io/badge/Jira-0052CC?style=for-the-badge&logo=jira&logoColor=white)",
      },
      {
        id: "trello",
        label: "Trello",
        template: "![Trello](https://img.shields.io/badge/Trello-0052CC?style=for-the-badge&logo=trello&logoColor=white)",
      },
      {
        id: "slack",
        label: "Slack",
        template: "![Slack](https://img.shields.io/badge/Slack-4A154B?style=for-the-badge&logo=slack&logoColor=white)",
      },
      {
        id: "discord",
        label: "Discord",
        template: "![Discord](https://img.shields.io/badge/Discord-5865F2?style=for-the-badge&logo=discord&logoColor=white)",
      },
    ],
  },
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
    Record<string, { color?: string; link?: string; theme?: string }>
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

      <div className="absolute left-1/2 top-1/2 w-[min(980px,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-950 shadow-2xl max-h-[80vh] overflow-y-auto">
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

          <section className="flex-1 p-5 sm:p-6 overflow-y-auto">
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
                          className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white/70 dark:bg-zinc-900/70 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-zinc-300 dark:focus:ring-700"
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

                    {tool.options?.theme ? (
                      <div className="mt-2">
                        <select
                          className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white/70 dark:bg-zinc-900/70 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-zinc-300 dark:focus:ring-700"
                          value={selection.theme ?? tool.options.theme.defaultValue}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => {
                            const next = e.target.value;
                            setToolOptionSelections((prev) => ({
                              ...prev,
                              [tool.id]: { ...(prev[tool.id] ?? {}), theme: next },
                            }));
                          }}
                        >
                          {tool.options.theme.values.map((value) => (
                            <option key={value} value={value}>
                              {value}
                            </option>
                          ))}
                        </select>
                      </div>
                    ) : null}

                    <div className="mt-2 text-[11px] text-zinc-600 dark:text-zinc-400 font-mono break-all">
                      {snippet}
                    </div>
                    {tool.workflow && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigator.clipboard.writeText(tool.workflow ?? "");
                        }}
                        className="mt-2 rounded-lg border border-zinc-300 dark:border-zinc-700 px-2.5 py-1.5 text-xs font-medium text-zinc-800 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
                      >
                        Copy Workflow
                      </button>
                    )}
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
