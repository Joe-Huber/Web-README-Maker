# Contributing to Web README Maker

Thanks for taking the time to improve Web README Maker. This guide explains how to report issues, propose changes, run the app locally, and submit pull requests.

## Ways to Contribute

You can help by:

- Reporting bugs in the markdown editor, live preview, badge toolbox, or responsive layout.
- Suggesting new features for README creation, badge generation, exports, or customization.
- Requesting new badges, themes, providers, or badge toolbox workflows.
- Improving documentation, examples, screenshots, or setup instructions.
- Fixing accessibility, keyboard navigation, focus, contrast, or mobile usability issues.

Before opening a new issue, please search existing issues and discussions to avoid duplicates.

## Issue Categories

Use the matching issue form when possible:

- Bug report: broken behavior, regressions, rendering problems, or runtime errors.
- Feature request: new editor, preview, export, customization, or workflow ideas.
- Badge toolbox request: new badges, themes, providers, or badge insertion behavior.
- Documentation issue: missing, outdated, unclear, or incorrect docs.
- UX or accessibility issue: keyboard, screen reader, contrast, focus, touch, or layout problems.

For potential security vulnerabilities, use GitHub security advisories instead of opening a public issue.

## Local Development

The Next.js app lives in the `web-readme-maker` directory.

```bash
git clone https://github.com/Joe-Huber/Web-README-Maker.git
cd Web-README-Maker/web-readme-maker
npm install
npm run dev
```

Then open `http://localhost:3000`.

Useful commands:

```bash
npm run dev
npm run lint
npm run build
```

## Project Structure

```text
.
|-- README.md
|-- CONTRIBUTING.md
|-- docs/
|-- .github/ISSUE_TEMPLATE/
`-- web-readme-maker/
    |-- app/
    |   |-- page.tsx
    |   |-- layout.tsx
    |   |-- globals.css
    |   `-- components/
    |       `-- BadgeToolbox.tsx
    |-- package.json
    `-- tsconfig.json
```

## Development Guidelines

- Follow the existing Next.js, React, TypeScript, and Tailwind CSS patterns.
- Keep changes focused on the issue or feature being addressed.
- Preserve safe markdown rendering. HTML handling should remain sanitized.
- Keep the editor and preview responsive across desktop and mobile widths.
- Favor accessible controls with clear labels, visible focus states, and keyboard support.
- Do not add dependencies unless they clearly reduce complexity or enable a necessary feature.
- Keep generated README snippets clean, portable, and safe to paste into GitHub.

## Badge Toolbox Guidelines

When adding or changing badge tools:

- Prefer stable public providers such as shields.io or well-documented README stats services.
- Keep placeholders consistent, such as `USERNAME`, `OWNER`, `REPO-NAME`, `THEME`, and `COLOR`.
- Make sure repository badges work with `owner/repo` and GitHub URL inputs when relevant.
- Include sensible defaults for colors, themes, links, and usernames.
- Avoid badges that require private tokens, secrets, or user-specific credentials.
- Check that inserted markdown has clean spacing around the cursor location.

## Pull Request Workflow

1. Fork the repository.
2. Create a branch from the latest default branch.
3. Make a focused change with clear commits.
4. Run linting and, when applicable, a production build.
5. Open a pull request with a concise description and screenshots for UI changes.

Suggested branch names:

```text
fix/preview-table-rendering
feature/export-readme-copy
docs/update-badge-guide
a11y/improve-keyboard-focus
```

## Pull Request Checklist

Before requesting review, please confirm:

- The change is scoped to one bug, feature, or documentation update.
- `npm run lint` passes from `web-readme-maker`.
- `npm run build` passes for app-level changes when practical.
- UI changes include screenshots or recordings.
- New badge behavior includes example markdown or provider documentation.
- Documentation is updated when behavior, setup, or screenshots change.
- No secrets, private tokens, or personal data are included.

## Manual Testing

For app changes, please smoke test the core workflow:

1. Start the app with `npm run dev`.
2. Edit markdown and confirm the preview updates.
3. Open the badge toolbox.
4. Insert at least one repository badge and one profile or social badge.
5. Try a GitHub URL and an `owner/repo` value.
6. Check the layout at desktop and mobile widths.

For markdown rendering changes, test tables, task lists, strikethrough, links, images, code blocks, and sanitized HTML.

## Commit Messages

Use short, descriptive commit messages in the imperative mood:

```text
Add badge toolbox issue template
Fix README preview table alignment
Improve mobile editor layout
```

## Review Expectations

Maintainers may ask for changes that improve accessibility, reduce complexity, match existing patterns, or keep generated markdown safe. Reviews are about making the project stronger, so please keep the conversation practical and respectful.

## License

By contributing, you agree that your contributions will be licensed under the same license as this project. See `LICENSE` for details.
