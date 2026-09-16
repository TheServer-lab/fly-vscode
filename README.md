# fly-vscode

VS Code language support for the **Fly programming language** — a high-level,
dynamically typed language with a first-party native toolchain (`fly`).

`fly-vscode` is a first-party companion to the Fly compiler. It never re-implements
the language or its toolchain: the real `fly` CLI is the source of truth, and this
extension only wires VS Code to it.

## Features

- **Language support** for `.fly` files (`language id: fly`, extension `.fly`).
- **Syntax highlighting** via a TextMate grammar (`source.fly`), built strictly from
  the real Fly lexer keyword list.
- **Language configuration** — `$` line comments, `$$ ... $$` block comments,
  bracket matching, auto-closing pairs, and folding for blocks/collections.
- **Build, Run and Build+Run commands** that invoke the real `fly` CLI:
  - `Fly: Build` — `fly -build` (projects) or `fly -compile <file> -finish -o <file>` (standalone files)
  - `Fly: Run` — `fly -run` (projects) or `fly -compile <file> -run -o <file>` (standalone files)
  - `Fly: Build and Run` — `fly -run` (projects, rebuilds when output is stale) or
    `fly -compile <file> -done -o <file>` (standalone files)
- **Project awareness** — the nearest `flylink.sleep` manifest is detected by walking
  up the directory tree (at most 8 levels, matching the compiler).
- **Compiler diagnostics** — `fly` errors (lex / parse / sema / codegen / module)
  are surfaced in the **Problems** panel through a problem matcher attached to every
  build/run task.
- **Terminal integration** — all compilation happens in the VS Code integrated
  terminal via real tasks, so you see exactly what `fly` outputs.
- **Task support** — `fly` tasks are contributed to the task provider
  (`Fly: Build`, `Fly: Run`, `Fly: Build and Run`).

## Requirements

- The Fly toolchain (`fly` and its sibling binaries) installed and available on
  `PATH`, or configured via the `fly.executable` setting.

## Usage

Open a `.fly` file — even a standalone file with no project — and use the command
palette (`Ctrl+Shift+P`):

| Command | What it does |
| --- | --- |
| `Fly: Build` | Compiles the current file/project (never runs). For single files, `-finish` keeps the binary and removes object `.o`/`.rc` artifacts. |
| `Fly: Run` | Compiles (if needed) then runs the program. |
| `Fly: Build and Run` | Builds then runs; for a project `fly -run` rebuilds only when the output is stale. |

Compiler errors are shown in the Problems panel. Clean build output remains visible
in the integrated terminal.

### Projects vs standalone files

When the current file is inside a directory that contains (or is up to 8 levels
below one that contains) a `flylink.sleep` manifest, the extension runs the
project-facing commands (`fly -build` / `fly -run`). Otherwise the file is treated
as a standalone single-file program and the standalone forms of `fly -compile`
are used. This exactly mirrors how the `fly` launcher resolves projects.

## Settings

| Setting | Default | Description |
| --- | --- | --- |
| `fly.executable` | `fly` | Path or command used to invoke the Fly toolchain. |

## Diagnostics

Every build/run task attaches the `fly.CompilerError` problem matcher, which
understands the real compiler's diagnostic lines:

```
path/file.fly:3:5: lex error: <detail>
path/file.fly:4:1: parse error: expected 'grab' but got 'grabe'
path/file.fly:3: error: cannot reassign hard variable 'X'
```

The matcher interprets the `file:line[:col]:` prefix (1-based) and converts it to
the 0-based locations VS Code uses. Launcher lines (e.g.
`fly-cc: compilation aborted due to the above error(s)`) are deliberately ignored.

## Known adjustments vs. the language docs

- The repo `README` documents the error keyword `grabe`, but the *compiler* (the
  source of truth) accepts only `grab` and rejects `grabe` with
  `parse error: expected 'grab' but got 'grabe'`. This extension uses `grab`.
- The runtime type names `num`, `dec`, `tex`, `yn`, `emp`, `coll`, `board` are not
  lexer keywords; they are built-in conversion functions / runtime type names.
  They are highlighted as `storage.type` for readability. Ordinary identifiers
  that merely happen to be named `num` etc. will share that scope — we do not
  invent new syntax to disambiguate.

## Development

```
npm install     # install dev dependencies
npm run compile # type-check + build (tsc -> out/)
npm test        # compile + run unit tests (grammar, project detection, CLI, diagnostics)
npm run integration  # compile + run end-to-end tests against the real Fly toolchain
npm run package # produce fly-vscode.vsix
```

### Tests

- **syntax** — tokenizes representative Fly source with a real TextMate engine
  (`vscode-textmate` + `vscode-oniguruma`) and asserts the expected scope names.
- **project detection** — `flylink.sleep` lookup incl. the 8-level depth limit.
- **CLI argument building** — checks the exact argument arrays produced for
  build/run/buildAndRun in both project and standalone modes.
- **diagnostics** — parses each of the four real compiler diagnostic formats and
  proves non-diagnostic launcher lines are ignored.
- **integration** — compiles a standalone file and a full project with the real
  `fly` binary, and checks the parser on its real error output.

## Architecture

`src/extension.ts` (activation/commands) depends on three small, testable modules:

- `src/cli.ts` — turns a command + file/project context into exact `fly` arguments.
- `src/project.ts` — `flylink.sleep` discovery (mirrors the compiler).
- `src/diagnostics.ts` — parses compiler stderr into structured diagnostics.

`src/tasks.ts` registers the `fly` task provider. There is deliberately *no* LSP,
debug adapter, formatter, or autocomplete in this release: the compiler is the
single source of truth and the extension stays a thin integration layer. The
module layout leaves room to add an LSP client later.

## Release notes

See `CHANGELOG.md`.

## License

MIT — see `LICENSE`.