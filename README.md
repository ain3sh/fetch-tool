# Deep Fetch

### _Web fetching that handles what built-in tools can't: images, clean markdown extraction, and organized file management—configured once at the server level, not in every prompt._

> **Note:** This is a fork of [kazuph/mcp-fetch](https://github.com/kazuph/mcp-fetch) with LLM-friendly configuration improvements. See [What's Different](#whats-different-v200) below.

Model Context Protocol server for fetching web content and processing images, **designed for humans to configure once and LLMs to use simply**.

## Why This Over Built-in Fetch Tools?

Most AI coding assistants include basic web fetching, but they're limited:

**Claude Code's WebFetch:**
- ✅ Fetches text and PDFs
- ❌ No image fetching
- ❌ No file saving
- ❌ Cannot handle JavaScript-rendered sites

**Cursor's @Web:**
- Focused on search queries for context
- Images require manual drag-and-drop

**Aider's /web:**
- Text-only scraping (httpx or Playwright)
- Designed for documentation lookups

**This tool adds:**
- **Image pipeline**: Fetch, resize, optimize, merge, and save images automatically
- **Clean markdown**: Uses Mozilla Readability + Turndown for article extraction
- **File management**: Organized local storage with date-based directories
- **Server-level config**: Set quality/dimensions/format once—LLMs just provide the URL
- **MCP protocol**: Works with any MCP-compatible client

Perfect for when you need web content *with* images, processed and saved locally, without making your LLM negotiate JPEG quality settings.

## Quick Start

### Option 1: Use Directly from GitHub (Recommended)

Add the following to your Claude Desktop configuration (`~/Library/Application Support/Claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "fetch": {
      "command": "npx",
      "args": ["-y", "github:ain3sh/fetch-tool"]
    }
  }
}
```

### Option 2: Clone and Build Locally

```bash
git clone https://github.com/ain3sh/fetch-tool.git
cd fetch-tool
npm install && npm run build
```

Then configure Claude Desktop:

```json
{
  "mcpServers": {
    "fetch": {
      "command": "node",
      "args": ["/absolute/path/to/fetch-tool/dist/index.js"]
    }
  }
}
```

Both options work the same - GitHub method is easier, local gives you more control.

## Features

- **Web Content Extraction**: Automatically extracts and formats web content as markdown
- **Article Title Extraction**: Extracts and displays the title of the article
- **Image Processing**: Optional processing of images from web pages with optimization
- **File Saving**: Images are saved to `~/Downloads/deep-fetch/YYYY-MM-DD/` directory (configurable)
- **Dual Output**: Both file saving and Base64 encoding for AI display (configurable)
- **JPEG Optimization**: Automatically optimizes images as JPEG for better performance
- **GIF Support**: Extracts first frame from animated GIFs
- **Security**: SSRF protection, robots.txt compliance, size limits, timeouts
- **Flexible Configuration**: Server-level configuration via CLI args and environment variables

## What's Different (v2.0.0)

This fork simplifies the tool interface for better LLM interaction:

- **🎯 Moved config to server-level**: Image quality, dimensions, output format, etc. configured once via CLI/env
- **✨ Simplified parameters**: LLM only sees `url`, `images` (bool/object), `text` (object) - no more parameter soup
- **🚀 Better defaults**: Sensible out-of-the-box configuration that just works
- **📝 Clear guidance**: Tool description tells LLMs exactly when to touch parameters and when not to
- **🔧 Flexible deployment**: Use directly from GitHub via npx, or clone locally

**Why this matters:** LLMs don't need to fiddle with JPEG quality settings or pixel dimensions on every request. You set your preferences once in the server config, and the LLM focuses on what content to fetch.

See the full [Changelog](#changelog) for migration details.

## Configuration

### Tool Parameters (LLM-Controlled)

The tool exposes minimal parameters to the LLM to keep the interface clean and focused:

**Required:**
- `url` (string): The URL to fetch

**Optional:**
- `images` (boolean or object): Enable image fetching
  - `true`: Enable with server defaults
  - `{ maxCount: number }`: Override max images (only change if user explicitly requests)
  - `{ saveDir: string }`: Custom save directory (LLM may set based on context)

- `text` (object): Text processing options
  - `raw` (boolean): Return raw HTML instead of markdown
  - `maxLength` (number): Override maximum content length (only change if user explicitly requests)

**Examples:**
```json
// Simple fetch
{ "url": "https://example.com" }

// Fetch with images
{ "url": "https://example.com", "images": true }

// Fetch with custom save location
{ "url": "https://example.com", "images": { "saveDir": "/path/to/project/docs" } }

// Fetch raw HTML
{ "url": "https://example.com", "text": { "raw": true } }
```

### Server Configuration

Most configuration is done at the server level, not per-request. Deep-fetch uses a clean separation:

- **CLI Arguments**: User-facing settings (image quality, dimensions, text length, etc.)
- **Environment Variables**: Low-level infrastructure settings (timeouts, byte limits, security guards)

This prevents duplication and makes configs clearer.

#### Complete Example Configuration

**For Claude Desktop** (`~/Library/Application Support/Claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "deep-fetch": {
      "type": "stdio",
      "command": "npx",
      "args": [
        "-y",
        "github:ain3sh/fetch-tool",
        "--text-max-length",
        "25000",
        "--image-max-count",
        "15",
        "--image-quality",
        "100",
        "--image-output",
        "both",
        "--image-max-width",
        "2500",
        "--image-max-height",
        "2500",
        "--image-layout",
        "merged",
        "--image-origin-policy",
        "cross-origin",
        "--image-start-index",
        "0",
        "--text-start-index",
        "0",
        "--ignore-robots-txt"
      ],
      "env": {
        "DEEP_FETCH_DEFAULT_SAVE_DIR": "/tmp/deep-fetch",
        "DEEP_FETCH_TIMEOUT_MS": "15000",
        "DEEP_FETCH_MAX_REDIRECTS": "5",
        "DEEP_FETCH_MAX_HTML_BYTES": "5000000",
        "DEEP_FETCH_MAX_IMAGE_BYTES": "10000000",
        "DEEP_FETCH_DISABLE_SSRF_GUARD": "0"
      },
      "source": "https://github.com/ain3sh/fetch-tool"
    }
  }
}
```

**For Claude Code** (`.mcp.json` in your project root):

```json
{
  "mcpServers": {
    "deep-fetch": {
      "type": "stdio",
      "command": "npx",
      "args": [
        "-y",
        "github:ain3sh/fetch-tool",
        "--text-max-length",
        "25000",
        "--image-max-count",
        "15",
        "--image-quality",
        "100",
        "--image-output",
        "both",
        "--image-max-width",
        "2500",
        "--image-max-height",
        "2500",
        "--image-layout",
        "merged",
        "--image-origin-policy",
        "cross-origin",
        "--ignore-robots-txt"
      ],
      "env": {
        "DEEP_FETCH_DEFAULT_SAVE_DIR": "/tmp/deep-fetch",
        "DEEP_FETCH_TIMEOUT_MS": "15000",
        "DEEP_FETCH_MAX_REDIRECTS": "5",
        "DEEP_FETCH_MAX_HTML_BYTES": "5000000",
        "DEEP_FETCH_MAX_IMAGE_BYTES": "10000000",
        "DEEP_FETCH_DISABLE_SSRF_GUARD": "0"
      },
      "source": "https://github.com/ain3sh/fetch-tool"
    }
  }
}
```

#### CLI Arguments

```json
{
  "mcpServers": {
    "fetch": {
      "command": "npx",
      "args": [
        "-y",
        "github:ain3sh/fetch-tool",
        "--image-output", "both",
        "--image-layout", "merged",
        "--image-max-count", "5",
        "--image-quality", "85",
        "--text-max-length", "50000"
      ]
    }
  }
}
```

**Available CLI Arguments:**

**Image Processing:**
- `--image-max-width <pixels>` (default: 1000, range: 100-10000)
- `--image-max-height <pixels>` (default: 4000, range: 100-10000)
- `--image-quality <1-100>` (default: 80)
- `--image-output <base64|file|both>` (default: base64)
- `--image-layout <merged|individual|both>` (default: merged)
- `--image-origin-policy <cross-origin|same-origin>` (default: cross-origin)
- `--image-start-index <number>` (default: 0)
- `--image-max-count <0-10>` (default: 3)
- `--default-save-dir <path>` (default: ~/Downloads/deep-fetch)

**Text Processing:**
- `--text-start-index <number>` (default: 0)
- `--text-max-length <chars>` (default: 20000)

**Security:**
- `--ignore-robots-txt` (default: respect robots.txt)

#### Environment Variables (Security & Infrastructure Only)

Environment variables are reserved for low-level settings that rarely change. Use CLI args for image/text processing.

**Available:**
- `DEEP_FETCH_DEFAULT_SAVE_DIR` (string, default: ~/Downloads/deep-fetch) - Base directory for saved images
- `DEEP_FETCH_TIMEOUT_MS` (number, default: 12000) - HTTP request timeout in milliseconds
- `DEEP_FETCH_MAX_REDIRECTS` (number, default: 3) - Maximum HTTP redirect hops
- `DEEP_FETCH_MAX_HTML_BYTES` (number, default: 2000000) - Maximum HTML response size (2MB)
- `DEEP_FETCH_MAX_IMAGE_BYTES` (number, default: 10000000) - Maximum image response size (10MB)
- `DEEP_FETCH_DISABLE_SSRF_GUARD` (0 or 1, default: 0) - Disable SSRF protection (⚠️ dangerous, keep enabled!)

**Example with env vars:**
```json
{
  "mcpServers": {
    "deep-fetch": {
      "command": "npx",
      "args": [
        "-y", "github:ain3sh/fetch-tool",
        "--image-output", "both",
        "--image-quality", "85"
      ],
      "env": {
        "DEEP_FETCH_DEFAULT_SAVE_DIR": "/tmp/deep-fetch",
        "DEEP_FETCH_TIMEOUT_MS": "15000",
        "DEEP_FETCH_MAX_HTML_BYTES": "5000000"
      }
    }
  }
}
```

#### Configuration Priority

Configuration is applied in this order (highest to lowest priority):
1. Per-request parameter (for the limited LLM-controlled params: `url`, `images.saveDir`, `images.maxCount`, `text.maxLength`)
2. CLI argument (image/text processing settings)
3. Environment variable (security/infrastructure settings only)
4. Built-in default

### Common Configuration Scenarios

**Save images to files only (no base64 in response):**
```json
{
  "mcpServers": {
    "fetch": {
      "command": "npx",
      "args": ["-y", "github:ain3sh/fetch-tool", "--image-output", "file"]
    }
  }
}
```

**Show images in Claude and save to disk:**
```json
{
  "mcpServers": {
    "fetch": {
      "command": "npx",
      "args": ["-y", "github:ain3sh/fetch-tool", "--image-output", "both"]
    }
  }
}
```

**High-quality images, more content:**
```json
{
  "mcpServers": {
    "fetch": {
      "command": "npx",
      "args": [
        "-y", "github:ain3sh/fetch-tool",
        "--image-quality", "95",
        "--image-max-count", "10",
        "--text-max-length", "100000"
      ]
    }
  }
}
```

**Same-origin images only (no CDN):**
```json
{
  "mcpServers": {
    "fetch": {
      "command": "npx",
      "args": ["-y", "github:ain3sh/fetch-tool", "--image-origin-policy", "same-origin"]
    }
  }
}
```

## For Developers

The following sections are for those who want to develop or modify the tool.

## Prerequisites

- Node.js 18+
- Claude Desktop or Claude Code (install from https://claude.ai/desktop)
- Works on Linux, macOS, and Windows (cross-platform)

## Installation

```bash
git clone https://github.com/ain3sh/fetch-tool.git
cd fetch-tool
npm install
npm run build
```

## Image Processing Specifications

When processing images from web content, the following optimizations are applied:

- Images are converted to JPEG format with quality control
- Maximum width limited to 1200px by default
- Maximum height limited to 1600px by default
- Chroma subsampling (4:2:0) for better compression
- MozJPEG optimization for smaller file sizes

## Development

After cloning and building locally, you can test the server:

```bash
# Run the server directly
npm start

# Or with arguments
node dist/index.js --image-quality 90 --text-max-length 50000
```

See the [Configuration](#configuration) section above for all available CLI arguments and environment variables.

## Security Features

- **SSRF Protection**: Only `http://` and `https://` URLs allowed
- **IP Filtering**: Blocks private/loopback/link-local IPs and local hostnames (e.g., `localhost`, `.local`)
- **Redirect Handling**: Manual redirect following with per-hop validation (max 3 hops)
- **Timeouts**: Request timeouts prevent hanging (default 12s, configurable)
- **Size Limits**: HTML up to 2MB, images up to 10MB (tunable via environment variables)
- **Robots.txt**: Respects robots.txt by default (can be disabled via config)

## Notes

- **Platform**: Cross-platform (Linux, macOS, Windows) - works anywhere Node.js runs
- **Image Processing**: Uses Sharp for high-performance image optimization
- **Merging**: Multiple images are merged vertically with size constraints
- **GIF Handling**: Animated GIFs automatically reduced to first frame
- **File Organization**: Images saved to `~/Downloads/deep-fetch/YYYY-MM-DD/` (configurable via `--default-save-dir`)
- **Source Code**: Organized in `src/` directory, compiled to `dist/` for distribution

## Changelog

### v2.0.0 (Fork - 2025-01-04)
- **BREAKING CHANGE**: Moved most parameters to server-level CLI args and environment variables
- **NEW**: Simplified tool interface - LLM only sees `url`, `images`, `text` parameters
- **NEW**: CLI argument parser for `--image-*`, `--text-*`, and `--ignore-robots-txt` flags
- **NEW**: Environment variable support for `MCP_FETCH_IMAGE_*` and `MCP_FETCH_TEXT_*`
- **NEW**: Configuration priority system: Request param > CLI arg > Env var > Default
- **IMPROVED**: Tool description now includes explicit LLM usage guidelines
- **IMPROVED**: Documentation confirms cross-platform support (not macOS-only)
- **REMOVED**: 15+ legacy parameters moved to server-level configuration

**Migration from v1.x:**
```json
// Before (v1.x): LLM had to manage all settings
{ "url": "...", "enableFetchImages": true, "returnBase64": true, "imageQuality": 80, ... }

// After (v2.0): Configure server once
"args": ["github:ain3sh/fetch-tool", "--image-output", "base64", "--image-quality", "80"]

// LLM just calls
{ "url": "...", "images": true }
```

---

### Original Upstream Releases

### v1.2.0
- **BREAKING CHANGE**: Tool name changed from `fetch` to `imageFetch` to avoid conflicts
- **NEW**: Automatic file saving - Images are now saved to `~/Downloads/mcp-fetch/YYYY-MM-DD/` by default
- **NEW**: Added `saveImages` parameter (default: true) to control file saving
- **NEW**: Added `returnBase64` parameter (default: false) for AI image display
- **BEHAVIOR CHANGE**: Default behavior now saves files instead of only returning base64
- Improved AI assistant integration with clear instructions for base64 option
- Enhanced file organization with date-based directories and structured naming

### v1.1.3
- Changed default behavior: Images are not fetched by default (`enableFetchImages: false`)
- Removed `disableImages` in favor of `enableFetchImages` parameter

### v1.1.0
- Added article title extraction feature
- Improved response formatting to include article titles
- Fixed type issues with MCP response content

### v1.0.0
- Initial release
- Web content extraction
- Image processing and optimization
- Pagination support

---

## Attribution

This project is a fork of [mcp-fetch](https://github.com/kazuph/mcp-fetch) by [kazuph](https://github.com/kazuph).

**Original work**: Copyright (c) 2024 kazuph
**License**: MIT
**Fork maintained by**: [ain3sh](https://github.com/ain3sh)

All credit for the core functionality, architecture, and original implementation goes to kazuph. This fork adds LLM-friendly configuration improvements while preserving the excellent foundation of the original project.
