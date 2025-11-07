# Release Notes v2.0.0

**Release Date**: 2025-01-04
**Type**: Major Version (Breaking Changes)
**Fork**: ain3sh/fetch-tool (based on kazuph/mcp-fetch v1.6.2)

## Overview

This is a fork of [kazuph/mcp-fetch](https://github.com/kazuph/mcp-fetch) v1.6.2 with major architectural improvements for LLM-friendly configuration. The primary goal is to simplify the tool interface by moving configuration from per-request parameters to server-level settings.

## Breaking Changes

### 🔴 Configuration Moved to Server Level

The majority of configuration options have been moved from tool call parameters to server-level configuration via CLI arguments and environment variables.

**Before (v1.x):**
LLM had to manage 15+ parameters per request:

```json
{
  "url": "https://example.com",
  "enableFetchImages": true,
  "returnBase64": true,
  "saveImages": true,
  "imageQuality": 80,
  "imageMaxWidth": 1000,
  "imageMaxHeight": 4000,
  "imageMaxCount": 3,
  "imageStartIndex": 0,
  "allowCrossOriginImages": true,
  "maxLength": 20000,
  "startIndex": 0,
  "raw": false,
  "ignoreRobotsTxt": false
}
```

**After (v2.0):**
LLM sees only essential parameters:

```json
{
  "url": "https://example.com",
  "images": true
}
```

Server configuration done once via CLI or env:

```bash
npx github:ain3sh/fetch-tool --image-output both --image-quality 90
```

### 🔴 Removed Parameters

The following parameters are **no longer available** as tool call parameters:

- `enableFetchImages` → Use `images: true` or `images: {...}`
- `returnBase64` → Configure via `--image-output base64` or `MCP_FETCH_IMAGE_OUTPUT=base64`
- `saveImages` → Configure via `--image-output file` or `MCP_FETCH_IMAGE_OUTPUT=file`
- `imageQuality` → Configure via `--image-quality` or `MCP_FETCH_IMAGE_QUALITY`
- `imageMaxWidth` → Configure via `--image-max-width` or `MCP_FETCH_IMAGE_MAX_WIDTH`
- `imageMaxHeight` → Configure via `--image-max-height` or `MCP_FETCH_IMAGE_MAX_HEIGHT`
- `imageStartIndex` → Configure via `--image-start-index` or `MCP_FETCH_IMAGE_START_INDEX`
- `allowCrossOriginImages` → Configure via `--image-origin-policy` or `MCP_FETCH_IMAGE_ORIGIN_POLICY`
- `startIndex` (text) → Configure via `--text-start-index` or `MCP_FETCH_TEXT_START_INDEX`
- `ignoreRobotsTxt` → Configure via `--ignore-robots-txt` or `MCP_FETCH_IGNORE_ROBOTS_TXT`

## New Features

### ✨ Simplified Tool Interface

**New Parameter Schema:**

```typescript
{
  url: string;                    // Required
  images?: boolean | {            // Optional
    maxCount?: number;            // Override server default (0-10)
    saveDir?: string;             // Custom save directory
  };
  text?: {                        // Optional
    raw?: boolean;                // Return raw HTML
    maxLength?: number;           // Override server default
  };
}
```

### 🛠️ CLI Arguments

Complete server configuration via command-line arguments:

```bash
npx github:ain3sh/fetch-tool \
  --image-output both \
  --image-layout merged \
  --image-quality 90 \
  --image-max-count 5 \
  --text-max-length 50000
```

**Available Arguments:**

**Image Processing:**
- `--image-max-width <pixels>` (default: 1000)
- `--image-max-height <pixels>` (default: 4000)
- `--image-quality <1-100>` (default: 80)
- `--image-output <base64|file|both>` (default: base64)
- `--image-layout <merged|individual|both>` (default: merged)
- `--image-origin-policy <cross-origin|same-origin>` (default: cross-origin)
- `--image-start-index <number>` (default: 0)
- `--image-max-count <0-10>` (default: 3)

**Text Processing:**
- `--text-start-index <number>` (default: 0)
- `--text-max-length <chars>` (default: 20000)

**Security:**
- `--ignore-robots-txt`

### 🌍 Environment Variables

Alternative configuration via environment variables:

```json
{
  "mcpServers": {
    "fetch": {
      "command": "npx",
      "args": ["-y", "github:ain3sh/fetch-tool"],
      "env": {
        "MCP_FETCH_IMAGE_OUTPUT": "both",
        "MCP_FETCH_IMAGE_QUALITY": "90",
        "MCP_FETCH_IMAGE_MAX_COUNT": "5",
        "MCP_FETCH_TEXT_MAX_LENGTH": "50000"
      }
    }
  }
}
```

**Available Variables:**
- `MCP_FETCH_IMAGE_MAX_WIDTH`
- `MCP_FETCH_IMAGE_MAX_HEIGHT`
- `MCP_FETCH_IMAGE_QUALITY`
- `MCP_FETCH_IMAGE_OUTPUT`
- `MCP_FETCH_IMAGE_LAYOUT`
- `MCP_FETCH_IMAGE_ORIGIN_POLICY`
- `MCP_FETCH_IMAGE_START_INDEX`
- `MCP_FETCH_IMAGE_MAX_COUNT`
- `MCP_FETCH_TEXT_START_INDEX`
- `MCP_FETCH_TEXT_MAX_LENGTH`
- `MCP_FETCH_IGNORE_ROBOTS_TXT`

### 🎯 Configuration Priority

**Priority Order:** Request param > CLI arg > Env var > Default

This allows flexibility while maintaining sensible defaults.

### 📝 Improved Tool Description

The tool description now includes explicit guidance for LLMs:

- ⚠️ **DO NOT** modify `maxCount` unless user explicitly specifies
- ✓ **MAY** set `saveDir` based on context
- Shows current server configuration in description
- Clear examples for common use cases

## Improvements

- **Cross-platform confirmed**: Documentation updated to reflect Linux/macOS/Windows support (not macOS-only)
- **Cleaner interface**: Reduced cognitive load for LLMs
- **Better defaults**: Sensible out-of-the-box configuration
- **User control**: Users set preferences once at server startup
- **Flexible deployment**: Use via GitHub npx or clone locally

## Migration Guide

### From v1.x to v2.0

**Step 1: Update MCP Configuration**

Old configuration:
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

New configuration:
```json
{
  "mcpServers": {
    "fetch": {
      "command": "npx",
      "args": [
        "-y", "github:ain3sh/fetch-tool",
        "--image-output", "both"
      ]
    }
  }
}
```

**Step 2: Remove Tool Parameter Customization**

If you were customizing parameters in your LLM prompts or code:

```javascript
// Before (v1.x)
await tool.call({
  url: "https://example.com",
  enableFetchImages: true,
  returnBase64: true,
  imageQuality: 90,
  imageMaxCount: 5
});

// After (v2.0) - Configure server once, LLM calls simplified
// In MCP config: "--image-output", "both", "--image-quality", "90", "--image-max-count", "5"
await tool.call({
  url: "https://example.com",
  images: true
});
```

**Step 3: Update Custom Configurations**

Map your old parameters to new server config:

| Old Parameter | New CLI Arg | New Env Var |
|---------------|-------------|-------------|
| `enableFetchImages: true` | Use `images: true` in call | N/A |
| `returnBase64: true` | `--image-output base64` | `MCP_FETCH_IMAGE_OUTPUT=base64` |
| `saveImages: true` | `--image-output file` | `MCP_FETCH_IMAGE_OUTPUT=file` |
| `imageQuality: 90` | `--image-quality 90` | `MCP_FETCH_IMAGE_QUALITY=90` |
| `imageMaxCount: 5` | `--image-max-count 5` | `MCP_FETCH_IMAGE_MAX_COUNT=5` |
| `maxLength: 50000` | `--text-max-length 50000` | `MCP_FETCH_TEXT_MAX_LENGTH=50000` |
| `ignoreRobotsTxt: true` | `--ignore-robots-txt` | `MCP_FETCH_IGNORE_ROBOTS_TXT=1` |

## Known Issues

None at this time.

## Attribution

This project is a fork of [mcp-fetch](https://github.com/kazuph/mcp-fetch) by [kazuph](https://github.com/kazuph).

**Original work**: Copyright (c) 2024 kazuph
**License**: MIT
**Fork maintained by**: [ain3sh](https://github.com/ain3sh)

All credit for the core functionality, architecture, and original implementation goes to kazuph. This fork adds LLM-friendly configuration improvements while preserving the excellent foundation of the original project.

## Feedback

Issues, suggestions, and contributions welcome at [github.com/ain3sh/fetch-tool](https://github.com/ain3sh/fetch-tool).
