# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**mcp-fetch** is a Model Context Protocol (MCP) server that provides web content fetching capabilities for AI assistants. It converts HTML pages to clean markdown using Mozilla Readability and optionally processes images using Sharp.

## Development Commands

```bash
# Build TypeScript to JavaScript
npm run build

# Type checking only (recommended before commits)
npm run typecheck

# Run all quality checks (biome linting + typecheck)
npm test

# Format code using Biome
npm run format

# Lint code using Biome
npm run lint

# Build and run the server
npm run dev

# Run the compiled server
npm start
```

## Architecture

### Single-File Design
- **Core logic**: All functionality is in `index.ts`
- **Type definitions**: External module types in `types.d.ts`
- This is intentional - the tool has focused scope and benefits from centralized logic

### Key Components
- **MCP Server**: Uses `@modelcontextprotocol/sdk` for protocol implementation
- **Configuration System**: CLI args & env vars → ServerConfig → Per-request overrides
- **Content Pipeline**: HTML → Readability → Markdown → Pagination
- **Image Pipeline**: Fetch → JPEG conversion → Vertical merging → File saving → Optional Base64 encoding
- **Parameter Validation**: Simplified Zod schema with only LLM-visible parameters

### Dependencies Architecture
- **Content Processing**: `@mozilla/readability` + `jsdom` + `turndown` chain
- **Image Processing**: `sharp` for high-performance image operations
- **HTTP**: `node-fetch` for web requests
- **Compliance**: `robots-parser` for robots.txt checking

## Code Patterns

### Configuration Architecture (NEW)
Most configuration moved to server-level (CLI args/env vars), not per-request parameters:

**Server Configuration (index.ts:66-219):**
```typescript
interface ServerConfig {
  imageMaxWidth: number;
  imageMaxHeight: number;
  imageQuality: number;
  imageOutput: "base64" | "file" | "both";
  imageLayout: "merged" | "individual" | "both";
  imageOriginPolicy: "cross-origin" | "same-origin";
  imageStartIndex: number;
  imageMaxCount: number;
  textStartIndex: number;
  textMaxLength: number;
  ignoreRobotsTxt: boolean;
}

const SERVER_CONFIG = loadServerConfig(process.argv.slice(2));
```

**Priority Order:** Request param > CLI arg > Env var > Default

### Parameter Handling
Simplified schema exposes only essential params to LLM (index.ts:602-633):

```typescript
const FetchArgsSchema = z.object({
  url: z.string().url(),
  images: z.union([
    z.boolean(),
    z.object({
      maxCount: z.number().int().min(0).max(10).optional(),
      saveDir: z.string().optional(),
    }),
  ]).optional(),
  text: z.object({
    raw: z.boolean().optional(),
    maxLength: z.number().int().positive().max(1000000).optional(),
  }).optional(),
});
```

**Rationale:** LLMs shouldn't manage image quality, dimensions, output formats, etc. Users configure these once at server startup.

### Error Handling
Network operations include comprehensive error handling with specific error types for different failure scenarios.

### Image Optimization and File Saving
- Images are always converted to JPEG format with configurable quality (default 80)
- Multiple images are merged vertically when present
- **Default behavior**: Images are automatically saved to `~/Downloads/mcp-fetch/YYYY-MM-DD/` directory
- **Optional**: Base64 encoding for Claude Desktop display (enabled with `returnBase64: true`)
- **Filename format**: `hostname_HHMMSS_index.jpg`

## Configuration

### Biome (Linting/Formatting)
- 2-space indentation
- Double quotes
- 80-character line width
- ES5 trailing commas
- Uses modern Biome instead of ESLint + Prettier

### TypeScript
- Target: ES2022
- Module: NodeNext (ESM)
- Strict mode enabled
- Output: `./dist`

## Testing Strategy

Current approach relies on:
1. TypeScript compilation as primary validation
2. Biome for code quality
3. Manual testing via Claude Desktop integration

**Note**: No unit tests are currently implemented. The `npm test` command runs typecheck + biome checks only.

## Deployment

The tool is designed for npx usage:
```bash
npx -y @kazuph/mcp-fetch
```

For Claude Desktop integration, add to MCP server configuration with optional customization:

**Basic (defaults):**
```json
{
  "mcpServers": {
    "fetch": {
      "command": "npx",
      "args": ["-y", "@kazuph/mcp-fetch"]
    }
  }
}
```

**With CLI arguments:**
```json
{
  "mcpServers": {
    "fetch": {
      "command": "npx",
      "args": [
        "-y", "@kazuph/mcp-fetch",
        "--image-output", "both",
        "--image-quality", "90"
      ]
    }
  }
}
```

**With environment variables:**
```json
{
  "mcpServers": {
    "fetch": {
      "command": "npx",
      "args": ["-y", "@kazuph/mcp-fetch"],
      "env": {
        "MCP_FETCH_IMAGE_OUTPUT": "both",
        "MCP_FETCH_IMAGE_QUALITY": "90"
      }
    }
  }
}
```

## Important Implementation Details

### Platform Specificity
- **Cross-platform**: Works on Linux, macOS, and Windows (anywhere Node.js runs)
- Sharp includes prebuilt binaries for all major platforms
- No OS-specific dependencies (contrary to old README claims about macOS-only clipboard operations)

### Content Processing Limits
- Default maxLength: 20,000 characters (configurable via server config)
- Supports pagination via startIndex (configured at server level)
- Image processing enabled per-request via `images` parameter

### Robots.txt Compliance
- Enabled by default for ethical web scraping
- Can be disabled via server config: `--ignore-robots-txt` or `MCP_FETCH_IGNORE_ROBOTS_TXT=1`

## Common Development Workflow

1. Make code changes in `index.ts`
2. Run `npm run typecheck` to verify TypeScript
3. Run `npm run format` to ensure consistent formatting
4. Run `npm test` to run all validations
5. Test manually with `npm run dev` or via Claude Desktop integration