# CLAUDE.md

AI guidance for Claude Code. Optimize for minimal token usage.

## COORDINATION AND WORKFLOW

**You are the coordinator.** Analyze requirements, delegate to specialists,
track progress.

```
User request → Claude analyzes → Claude delegates to specialists → Claude coordinates results
```

### Task Analysis Framework

- Parse requirements to identify core objectives and technical domains
- Decompose complex work into manageable, delegatable subtasks
- Identify parallel vs sequential execution opportunities
- Determine quality requirements and validation needs

### Specialist Agent Delegation

Use TodoWrite extensively for task tracking. Delegate to appropriate
specialists:

**Complex Features:** fullstack-engineer (multi-layer functionality) **UI/UX
Focus:** frontend-specialist (React, components, accessibility)  
**Server-side:** backend-specialist (APIs, databases, architecture) **System
Design:** system-architect (architectural decisions, patterns) **Quality
Assurance:** test-engineer (after implementation) → code-reviewer (before
completion)

### Parallel Execution Strategy

- Run independent tasks simultaneously for efficiency
- Frontend and backend work can often proceed in parallel
- Documentation and testing alongside implementation
- Respect critical dependencies (design → implementation → review)

## AGENTS (.claude/agents/\*.md)

**Specialists:** fullstack-engineer, frontend-specialist, backend-specialist,
system-architect, test-engineer, code-reviewer

## RULES

1. Use specialist agents for implementation work
2. pnpm lint/typecheck/test/build before commits
3. NO: any types, --no-verify, console.log
4. Pre-commit hooks mandatory

## DOCS (reference when needed)

- `docs/Project_Requirements_Doc_Sept32025.md` - Project vision
- `docs/CODING_STANDARDS.md` - Code standards
- `docs/QA_ENFORCEMENT.md` - Quality processes
- `packages/ui/DESIGN_SYSTEM.md` - UI patterns
- `packages/ui/STORYBOOK_TEMPLATE.md` - Story templates

## PROJECT

Turborepo monorepo: Electron desktop app + browser automation + Ollama LLM +
React UI (Atomic Design)

**Apps:** desktop (Electron), storybook  
**Packages:** ui (React components), browser (automation), llm (Ollama),
\*-config (shared configs)

## COMMANDS

```bash
# Dev
pnpm dev                    # all
pnpm -F desktop dev        # Electron
pnpm -F storybook dev      # Storybook

# Quality (before commit)
pnpm lint
pnpm typecheck
pnpm test
pnpm build

# Build/Package
pnpm -F desktop package    # package app
pnpm -F desktop make       # distributable
```

## ARCHITECTURE

**Monorepo:** Turborepo + pnpm workspaces + TypeScript strict **UI:** Atomic
Design (atoms→molecules→organisms→templates→pages) **Electron:**
main/renderer/preload separation, webpack via Forge **Key files:**

- UI exports: `packages/ui/src/index.ts`
- Main: `apps/desktop/src/main.ts`
- Renderer: `apps/desktop/src/renderer.tsx`
- Webview types: `packages/ui/src/types/electron-webview.d.ts`

## QUALITY

**Zero tolerance:** No errors, warnings, any types, console.log, eslint-disable
**Hooks:** Husky + lint-staged (pre-commit/push) **TypeScript:** strict mode,
exactOptionalPropertyTypes

## QUICK REFS

**Add deps:** `pnpm add -F @packages/ui [package]` **Filter:**
`--filter=desktop` or `--filter=@packages/ui` **IPC:** window.electronAPI
(preload exposed) **Turbo:** build depends on ^build, dev no cache

## DOCUMENTATION GUIDELINES

### Writing New Docs

When creating documentation:

1. **Location:** Place in `docs/` for project-wide, `packages/[name]/` for
   package-specific
2. **Style:** Write in plain narrative text (see
   docs/Project_Requirements_Doc_Sept32025.md as example)
3. **Avoid:** Code examples unless essential, overly specific library references
4. **Focus:** Methodologies, patterns, concepts over implementation details

### Markdown for AI Optimization

- **Headers:** Use clear hierarchical structure (##, ###)
- **Lists:** Prefer bullets over long paragraphs
- **Length:** Keep sections concise - AI reads entire file
- **References:** Link to other docs rather than duplicating content
- **Tables:** Use sparingly, bullets often clearer for AI

### Updating Agent References

When adding new documentation that agents should know about:

1. **Update CLAUDE.md:** Add to DOCS section with brief description
2. **Update relevant agents:** Add "For [topic], reference [path] when needed"
   to agent prompts
3. **Keep it conditional:** Use "when needed" or "as needed" to avoid loading
   unnecessarily

Example agent update:

```
For testing patterns, consult docs/TESTING_STRATEGY.md when needed.
```

### Doc Template

```markdown
# [Feature/System Name]

## Overview

Brief description of purpose and scope.

## Key Concepts

- Concept 1: explanation
- Concept 2: explanation

## Architecture/Approach

Narrative description of how it works.

## Patterns and Best Practices

What patterns to follow and why.

## References

- Related docs
- External resources (if essential)
```
