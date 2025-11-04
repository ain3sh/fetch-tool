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
   - Make your changes in `index.ts` or other files
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
2. `index.ts` (in the Server constructor, around line 1155)

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

1. Add to `parseCliArgs()` function (index.ts:86-144)
2. Add to `ServerConfig` interface (index.ts:66-81)
3. Add to `loadServerConfig()` env var section (index.ts:167-204)
4. Update documentation in README.md
5. Update CLAUDE.md examples

### Adding a New Tool Parameter

1. Update `FetchArgsSchema` (index.ts:602-633)
2. Update tool description (index.ts:1190-1235)
3. Handle in request handler (index.ts:1248-1409)
4. Update documentation

## Getting Help

- **Questions?** Open a [Discussion](https://github.com/ain3sh/fetch-tool/discussions)
- **Bugs?** Open an [Issue](https://github.com/ain3sh/fetch-tool/issues)
- **Want to chat?** Comment on an existing issue or PR

---

## Original Japanese Guidelines (from upstream kazuph/mcp-fetch)

<details>
<summary>View original contributing guidelines</summary>

## 開発ルール（必読）
- main（マスター）へ「直接 push」しないこと。必ず Pull Request（PR）で変更を取り込みます。
- 変更はトピックブランチで行い、命名は `feat/*`, `fix/*`, `chore/*`, `release/*` などを推奨します。
- リリース作業は以下のフローに従います。
  1. バージョンを `package.json` とサーバーメタ（`index.ts` 内の `version`）で更新
  2. `RELEASE_NOTES_vX.Y.Z.md` を追加
  3. ブランチ名 `release/vX.Y.Z` を作成し、コミット・push
  4. PR を作成（base: `main`, head: `release/vX.Y.Z`）
  5. CI が通過後にレビューを経て `main` へマージ
  6. `main` へマージされたときのみ、GitHub Actions が npm へ publish（既に公開済みのバージョンは自動スキップ）
- 直接タグ push による公開は行いません（`publish.yml` は `push` to `main` でのみ発火）。
- PR が `main` にマージされると、以下が自動実行されます：
  - npm publish（未公開バージョンのみ）
  - タグ作成と GitHub Releases の発行（未作成のときのみ）
- コミットメッセージは Conventional Commits を推奨（例: `fix: correct image fetch default`）。
- テスト方針：`npm test` は unit → typecheck → format → biome を通過する必要があります。
- テストでローカル HTTP サーバを用いるため、以下の環境変数でサーバ起動や SSRF ガードを無効化します（本番では設定しないこと）。
  - `MCP_FETCH_DISABLE_SERVER=1`
  - `MCP_FETCH_DISABLE_SSRF_GUARD=1`

## PR テンプレ
- 目的 / 背景
- 変更点（ユーザー影響 / 互換性）
- セキュリティ観点（ネットワーク/ファイルI/O 等の変更があれば明記）
- 動作確認（スクショ/ログ/テスト結果）
- リリースノート（必要に応じて）

</details>
