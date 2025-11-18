# Deep Fetch

An MCP server for fetching web content with intelligent caching, clean markdown extraction, and image processing. Designed for AI agents that need web content without the limitations of built-in fetch tools.

## Features

- **Clean Extraction** - Mozilla Readability strips ads, navigation, and clutter
- **Image Pipeline** - Fetch, optimize, merge vertically, save as JPEG
- **Automatic Caching** - URL deduplication prevents redundant fetches
- **Organized Storage** - Content saved to titled directories with YAML frontmatter
- **Batch Processing** - Fetch multiple URLs in parallel
- **LLM-Friendly** - Simple parameters for agents, detailed config at server level

## Quick Start

```bash
npx -y github:ain3sh/fetch-tool
```

Or add to your MCP configuration:

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

## Usage

### Basic Fetching

```json
{ "url": "https://example.com" }
```

### With Images

```json
{ "url": "https://example.com", "images": true }
```

### Multiple URLs (Parallel)

```json
{ "url": ["https://a.com", "https://b.com", "https://c.com"] }
```

### Force Refresh Cached Content

```json
{ "url": "https://example.com", "refresh": true }
```

### Custom Directory Name

```json
{ "url": "https://example.com", "name": "my-docs" }
```

## Output Structure

Content is automatically organized:

```text
~/deep-fetch/
├── manifest.json                    # Cache manifest
└── content/
    └── understanding-react-hooks/   # Auto-named from page title
        ├── CONTENT.md               # Markdown with frontmatter
        └── images/
            ├── 0_hero.jpg
            └── 1_diagram.jpg
```

### Markdown Format

```markdown
---
url: https://react.dev/learn
title: Understanding React Hooks
fetched: 2025-01-18T10:30:00Z
---

# Understanding React Hooks

[Clean extracted content...]
```

## Configuration

### Server Arguments

Configure once when starting the server:

#### Image Processing
- `--image-output <base64|file|both>` - Output mode (default: base64)
- `--image-quality <1-100>` - JPEG quality (default: 80)
- `--image-max-width <pixels>` - Max width (default: 1000)
- `--image-max-height <pixels>` - Max height (default: 4000)
- `--image-max-count <0-10>` - Images per page (default: 3)
- `--image-layout <merged|individual|both>` - Layout style (default: merged)

#### Text Processing
- `--text-max-length <chars>` - Max characters (default: 20000)

#### Storage
- `--content-dir <path>` - Content directory (default: ~/deep-fetch)
- `--default-save-dir <path>` - Image save directory (default: ~/Downloads/deep-fetch)

#### Caching
- `--cache-enabled` - Enable caching (default)
- `--no-cache` - Disable caching

#### Security
- `--ignore-robots-txt` - Bypass robots.txt checks

### Example Configurations

#### High-Quality Archival
```json
"args": [
  "-y", "github:ain3sh/fetch-tool",
  "--image-output", "both",
  "--image-quality", "95",
  "--image-max-count", "10"
]
```

#### Documentation Gathering
```json
"args": [
  "-y", "github:ain3sh/fetch-tool",
  "--text-max-length", "100000",
  "--image-max-count", "0"
]
```

#### Quick Preview
```json
"args": [
  "-y", "github:ain3sh/fetch-tool",
  "--image-output", "base64",
  "--image-quality", "70",
  "--no-cache"
]
```

### Environment Variables

```bash
DEEP_FETCH_TIMEOUT_MS=12000        # Request timeout in milliseconds
DEEP_FETCH_MAX_REDIRECTS=3         # Max HTTP redirects to follow
DEEP_FETCH_MAX_HTML_BYTES=2000000  # Max HTML size (2MB)
DEEP_FETCH_MAX_IMAGE_BYTES=10000000 # Max image size (10MB)
DEEP_FETCH_DEFAULT_SAVE_DIR=/path  # Default image save directory
DEEP_FETCH_DISABLE_SSRF_GUARD=1    # Disable SSRF protection (use with caution)
```

## Tool Parameters

Parameters available to AI agents:

| Parameter | Type | Description |
|-----------|------|-------------|
| `url` | string \| string[] | URL(s) to fetch (max 10 for batch) |
| `name` | string | Custom directory name (single URL only) |
| `refresh` | boolean | Bypass cache and re-fetch |
| `images` | boolean \| object | Enable image fetching |
| `images.maxCount` | number | Override server's image count |
| `images.saveDir` | string | Custom save directory |
| `text.raw` | boolean | Return raw HTML instead of markdown |
| `text.maxLength` | number | Override server's max length |

## How It Works

### Content Extraction

```text
URL → fetch → JSDOM → Readability → Turndown → Markdown
```

Uses Mozilla's Readability algorithm (same as Firefox Reader View) to extract article content, then converts to clean markdown.

### Image Pipeline

1. **Discovery** - Extract images from article content (not ads/nav)
2. **Validation** - SSRF protection, size limits
3. **Fetch** - Download with timeout protection
4. **Optimize** - Convert to JPEG with mozjpeg
5. **Merge** - Stack vertically into single image
6. **Output** - Base64 for display + file for archival

### Caching

- URL-based manifest tracks fetched content
- Content hash detects changes
- `refresh: true` bypasses cache
- Cache can be disabled with `--no-cache`

## Security

- **SSRF Protection** - Blocks private IPs and localhost
- **robots.txt** - Respects by default
- **Size Limits** - 2MB HTML, 10MB images
- **Timeouts** - 12 second default
- **Redirect Validation** - Manual following, max 3

## Development

```bash
git clone https://github.com/ain3sh/fetch-tool.git
cd fetch-tool
npm install
npm run build
npm test
```

### Dependencies

- `@mozilla/readability` - Article extraction
- `turndown` - HTML to Markdown
- `sharp` - Image processing
- `jsdom` - DOM parsing
- `node-fetch` - HTTP client

## License

MIT

Fork of [mcp-fetch](https://github.com/kazuph/mcp-fetch) by [kazuph](https://github.com/kazuph).
