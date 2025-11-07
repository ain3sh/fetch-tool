# Contributing

> **Note:** This is a fork of [kazuph/mcp-fetch](https://github.com/kazuph/mcp-fetch). For contributing to the original project, see their repository.

## Development Workflow

This fork is used directly from GitHub via `npx github:ain3sh/fetch-tool` - **no npm publishing required**.

### Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/ain3sh/fetch-tool.git
   cd fetch-tool
   npm install
   ```

2. **Make your changes**
   - Create a feature branch: `feat/your-feature-name`
   - Make your changes in `src/index.ts` or other source files
   - Follow existing code style (Biome will enforce this)

3. **Test your changes**
   ```bash
   npm test  # Runs: unit tests → typecheck → format → biome checks
   ```

4. **Submit a Pull Request**
   - Push your branch to GitHub
   - Create a PR against `main`
   - Describe what you changed and why

## Development Rules

- ❌ **NO direct pushes to `main`** - always use Pull Requests
- ✅ Branch naming: `feat/*`, `fix/*`, `chore/*`, `docs/*`
- ✅ Commit messages: Use [Conventional Commits](https://www.conventionalcommits.org/)
  - `feat: add custom save directory support`
  - `fix: correct image quality validation`
  - `docs: update configuration examples`
  - `chore: bump dependencies`
- ✅ **All tests must pass**: `npm test` before submitting PR

## Version Updates

For breaking changes or major features, update the version in:
1. `package.json` (line 3)
2. `src/index.ts` (in the Server constructor)

Use [Semantic Versioning](https://semver.org/):
- **Major (X.0.0)**: Breaking changes
- **Minor (0.X.0)**: New features, backward compatible
- **Patch (0.0.X)**: Bug fixes

## Testing

### Run All Tests
```bash
npm test
```

This runs in sequence:
1. **Unit tests** (`vitest`) - Tests image processing, URL validation, etc.
2. **Type checking** (`tsc --noEmit`) - Ensures TypeScript compiles
3. **Formatting** (`biome format`) - Code style consistency
4. **Linting** (`biome check`) - Code quality checks

### Run Individual Checks
```bash
npm run typecheck  # TypeScript only
npm run format     # Format code
npm run lint       # Lint only
npm run unit       # Unit tests only
```

### Testing Environment Variables

Some tests require special environment variables:

- `MCP_FETCH_DISABLE_SERVER=1` - Disables MCP server startup (for unit tests)
- `MCP_FETCH_DISABLE_SSRF_GUARD=1` - Disables SSRF protection (for testing with localhost)

**⚠️ NEVER use these in production!**

## PR Template

When creating a PR, please include:

### Purpose
What problem does this solve? What feature does it add?

### Changes
- What did you change?
- Is this a breaking change?
- Does it affect users or just internal code?

### Security Considerations
- Does this change network operations?
- Does this change file I/O?
- Could this introduce vulnerabilities?

### Testing
How did you verify it works?
- Screenshots (for UI/output changes)
- Logs (for behavior changes)
- Test results (paste `npm test` output)

## Code Style

We use [Biome](https://biomejs.dev/) for formatting and linting:
- 2-space indentation
- Double quotes
- 80-character line width
- ES5 trailing commas

The `npm test` command will automatically check this.

## Common Development Tasks

### Adding a New CLI Argument

1. Add to `parseCliArgs()` function in `src/index.ts`
2. Add to `ServerConfig` interface in `src/index.ts`
3. Add to `loadServerConfig()` env var section in `src/index.ts`
4. Update documentation in README.md
5. Update docs/CLAUDE.md examples

### Adding a New Tool Parameter

1. Update `FetchArgsSchema` in `src/index.ts` (around line 584)
2. Update tool description in `src/index.ts`
3. Handle in request handler in `src/index.ts`
4. Update documentation in README.md and docs/CLAUDE.md

## Getting Help

- **Questions?** Open a [Discussion](https://github.com/ain3sh/fetch-tool/discussions)
- **Bugs?** Open an [Issue](https://github.com/ain3sh/fetch-tool/issues)
- **Want to chat?** Comment on an existing issue or PR
