# Commit Conventions

## Message Format

Use this format for the first line of every commit message:

```text
<type>: <subject>
```

Allowed `type` values:
- `feat`
- `fix`
- `refactor`
- `test`
- `docs`
- `chore`

Rules:
- `subject` must contain at least 1 character (cannot be empty)

Examples:
- `feat: add enrollment apply api`
- `fix: prevent over-capacity enrollment`
- `docs: add flyway guide`

## Hook Installation

This project uses a pure Git hook script (no Node/Husky).

Unix/macOS (Git Bash/Linux):

```bash
bash scripts/setup-githooks.sh
```

Windows (Command Prompt):

```bat
scripts\setup-githooks.bat
```

What setup does:
- Sets `core.hooksPath` to `.githooks`
- Uses `.githooks/commit-msg` to validate commit messages
- On Unix/Git Bash, ensure executable permission if needed:

```bash
chmod +x .githooks/commit-msg
```

## Temporary Bypass (Use Sparingly)

You can bypass hooks once with:

```bash
git commit --no-verify -m "feat: your message"
```

Use this only for exceptional cases. Do not overuse it, because it weakens team-wide commit quality.
