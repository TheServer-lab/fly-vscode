# Changelog

All notable changes to `fly-vscode` are documented here.

## [0.1.0] - 2026-09-16

Initial release.

### Added

- `.fly` file association (language id `fly`).
- TextMate syntax highlighting (`source.fly`) built from the real Fly lexer
  keyword set: control flow, declarations, statement keywords, logical and
  bitwise operators, string interpolation and escapes, comments, numeric
  literals, and the `Yes` / `No` / `EMP` literals.
- Language configuration: `$` line comments, `$$ ... $$` block comments,
  brackets, auto-closing pairs, surrounding pairs, and folding markers.
- Commands:
  - `Fly: Build`
  - `Fly: Run`
  - `Fly: Build and Run`
- Project detection via `flylink.sleep` (up to 8 directory levels, matching the
  compiler's own lookup).
- Compiler diagnostics in the Problems panel via the `fly.CompilerError`
  problem matcher (lex / parse / sema / codegen / module errors).
- `fly` task provider contributing build/run tasks to the integrated terminal.
- Setting `fly.executable` (default `fly`) to point at a custom toolchain binary.
- Unit tests (syntax grammar, project detection, CLI argument building,
  diagnostics parsing) and end-to-end integration tests that compile real Fly
  files and projects with the real `fly` toolchain.