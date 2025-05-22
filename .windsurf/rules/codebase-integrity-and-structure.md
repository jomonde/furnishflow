---
trigger: manual
---

Rule Description:
Enforce a clean, scalable, and redundancy-free codebase. Ensure environment-safe practices, organized structure, and precision in code changes. This rule helps maintain long-term maintainability and minimizes technical debt.

🔁 Redundancy Prevention
Before creating any new file, check the entire codebase for existing components, utilities, or patterns that already solve the problem.

Re-use instead of re-writing. Extend or import shared modules from shared/ when possible.

Avoid duplicating logic across features—leverage path aliases and barrel exports (index.ts) to simplify imports and centralize utilities.

🧪 Environment-Aware Development
Use process.env.NODE_ENV to safely gate dev/test-only logic (e.g., logging, debugging tools).

Never add stubbed or fake data to any logic that runs in development or production.

Do not overwrite or modify .env files without first prompting for and receiving confirmation.

Ensure all environment variables have fallback defaults and type-safe checks.

🧼 Code Cleanliness & File Discipline
No file should exceed 300 lines of code. If it does, refactor into smaller, purposeful modules.

Avoid scripts inside functional files—especially if they’re intended to run only once. Move to a scripts/ folder or omit entirely.

Maintain clarity in naming and folder structure. No vague names like misc, temp, or utils2.

🛠️ Bug Fixes & New Patterns
When fixing bugs, prioritize existing patterns and tools already used in the codebase.

Only introduce new patterns or dependencies when all existing options are proven insufficient.

Validate dependency conflicts and prevent duplication of similar functionality.

New technologies or methods must be documented and reviewed before adoption.

🧭 Controlled Modifications
Only implement explicitly requested features, bug fixes, or refactors.

Avoid speculative changes unless paired with a clear benefit (e.g., performance, readability).

Use meaningful, consistent commit messages that describe what and why, not just how.

✅ Enforcement Guidance:
This rule should be enforced at PR level, during code generation prompts, and when reviewing architectural changes. It ensures that FurnishFlow evolves cleanly, avoids chaos, and empowers new team members to onboard quickly and safely.

Let me know if you want this saved as a markdown file (e.g., RULES/codebase-integrity-and-structure.md) for inclusion in your project or documentation repo.






You said:
windsurf seems to hang up when calling out to the terminal, usually happens after creating a new directory


ChatGPT said:
Thanks for reporting that. The issue you're seeing—Windsurf hanging after directory creation when calling out to the terminal—is likely related to one of the following:

🧠 Probable Causes
Blocking Shell Command
Some shell commands (like mkdir, mv, rm, or git init) may be run synchronously by Windsurf’s agent, and depending on how the system handles process streams, it may wait indefinitely for input or feedback.

File Watcher Interruption
When a new directory is created, it might trigger a reload or watcher that conflicts with Windsurf’s agent or editor connection—especially if it's deeply nested or triggers a reindexing of the workspace.

Permission or Environment Conflict
Creating folders in certain locations may trigger permission prompts (especially on Windows or macOS with strict UAC settings), which stall the agent when unattended.

✅ Workaround Suggestions
Until Windsurf patches the bug, here’s what you can do:

Manually Create the Directory
If you know Windsurf hangs when creating a directory:

Create the directory yourself in your terminal or file explorer.

Then return to Windsurf and continue the prompt.
(E.g., create src/features/clients manually before continuing with component generation.)

Use Code-Only Instructions
Instead of letting Windsurf handle directory creation, tell it:

pgsql
Copy
Edit
Assume src/features/clients already exists. Generate only the files and imports needed inside it.
Restart the Agent if Stuck
If Windsurf freezes:

Stop the session or restart the AI agent (check for a “Restart” or “Kill process” button).

Re-run your last successful command without file creation.

Report to Windsurf Support
Log the issue with details: OS, browser/editor used, and the command that caused the hang. It’s likely a known bug, and they may have a hotfix.