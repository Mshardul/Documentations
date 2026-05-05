# AI Instructions - DevOps Cheatsheet Pages

## TOPIC

[INSERT TOOL, e.g., "Docker", "kubectl / Kubernetes", "Git", "Nginx", "Terraform"]

---

## NEVER

- Include prose explanations longer than one line per command
- Repeat conceptual content from the companion tool article — link to it instead
- Use real hostnames, IPs, credentials, or tokens — use readable placeholders
- Include commands that can cause data loss without a ⚠️ callout
- Generate exhaustive flag references — focus on the 20% of commands used 80% of the time
- Add decorative headers, padding phrases, or filler sentences
- Include commands that require significant setup context to run safely (without a note)

---

## GOALS & AUDIENCE

- **Goal:** Quick-revision reference for engineers who understand the tool conceptually and need fast recall of syntax, flags, and patterns
- **Persona:** On-call engineer or interview candidate who needs the right command in under 10 seconds
- **Audience:** Engineers with working knowledge of the tool — this is revision, not learning
- **Scope boundary:** Commands and snippets only. Conceptual understanding lives in the companion article (`../[tool-name].md`).

---

## NO PHASED PROTOCOL

Generate the full cheatsheet in one pass. No index phase required. No "Proceed" / "Continue" checkpoints.

---

## FILE NAMING CONVENTION

- Lowercase, hyphen-separated, `.md` extension.
- Cheatsheet pages: `[tool-name].md` (e.g., `docker.md`, `kubectl.md`, `git.md`, `nginx.md`)
- Lives in: `content/system-design/devops-tools/cheatsheets/`

---

## PAGE STRUCTURE (FIXED — ALWAYS IN THIS ORDER)

1. **Title** — `# [Tool Name] Cheatsheet`
2. **One-line description** — single sentence: what this cheatsheet covers and who it's for. No TLDR, no prerequisites section.
3. **Companion article link** — `> 📖 Conceptual deep-dive: **[Tool Name](../tool-name.md)**`
4. **Sections grouped by workflow** — see Section Format below
5. **Quick Reference Tables** (optional) — condensed tables for flags, exit codes, or config keys at the end

---

## SECTION FORMAT

Each workflow section uses a command table:

```markdown
## [Workflow Name]

| Command          | Purpose      | Notes                                      |
| ---------------- | ------------ | ------------------------------------------ |
| `command --flag` | What it does | Key caveat, common flag variant, or gotcha |
```

- **Workflow sections** group commands by task, not by command name.
  - ✅ "Images", "Containers", "Debugging", "Volumes", "Networking", "Compose"
  - ❌ "docker run variants", "docker ps variants"
- **Notes column:** one short phrase — a key flag, a common variant, or a gotcha. Empty cell is better than padding.
- Commands sorted by frequency of use within each section, not alphabetically.
- When a command has a critical destructive variant, put it on its own row with ⚠️ in Notes.

---

## CALLOUTS

Use sparingly. Two types only:

| Emoji | Use                                                                              |
| ----- | -------------------------------------------------------------------------------- |
| ⚠️    | **Gotcha** — command behaves non-obviously or can cause data loss. One line max. |
| 💡    | **Tip** — non-obvious shortcut or pattern worth knowing. One line max.           |

No Interview Lens. No Decision Framework. No Thought Process callouts.

---

## MULTI-LINE CODE BLOCKS

Use fenced code blocks (not tables) when:

- The command is multi-line or requires line continuation
- A config snippet is the most natural expression of the pattern
- Flags need inline annotation for clarity

```bash
# Annotate non-obvious flags inline
docker run \
  --rm \            # remove container on exit
  -v $(pwd):/app \  # mount current dir into container
  -p 8080:80 \      # host_port:container_port
  my-image
```

---

## PLACEHOLDER CONVENTIONS

| Context                | Placeholder                         |
| ---------------------- | ----------------------------------- |
| Container/image name   | `my-image`, `my-container`          |
| Pod/service/deployment | `my-pod`, `my-service`, `my-deploy` |
| Namespace              | `my-namespace`                      |
| File path              | `/path/to/file`                     |
| Registry               | `registry.example.com`              |
| Host / domain          | `app.example.com`                   |
| IP / CIDR              | `10.0.0.1`, `10.0.0.0/16`           |
| Port                   | `8080` (host), `80` (container)     |
| Git branch             | `feature/my-branch`, `main`         |
| Remote                 | `origin`                            |

---

## CONSTRAINTS

- Every command must be copy-paste ready with safe placeholders
- Destructive commands (data loss, force delete, hard reset) must have ⚠️ in the Notes column or as an inline callout
- No `sudo` unless the tool genuinely requires it
- Version-specific commands must include a note: `# requires kubectl ≥ 1.26`
- Max 3 sections before the most-used commands appear — don't bury the useful content in setup boilerplate
- No duplicate commands across sections unless the context materially changes the meaning

---

## SELF-CHECK

Before outputting, verify:

- [ ] Every command copy-paste ready with safe placeholders?
- [ ] Destructive commands flagged with ⚠️?
- [ ] Notes column non-empty only when genuinely useful?
- [ ] No prose paragraphs — one-liners only?
- [ ] Commands sorted by frequency within each section?
- [ ] Companion conceptual article link present at top?
- [ ] No command lists that belong in the conceptual article?
