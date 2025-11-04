# MCP Fetch

Model Context Protocol server for fetching web content and processing images. This allows Claude Desktop (or any MCP client) to fetch web content and handle images appropriately.

<a href="https://glama.ai/mcp/servers/5mknfdhyrg"><img width="380" height="200" src="https://glama.ai/mcp/servers/5mknfdhyrg/badge" alt="@kazuph/mcp-fetch MCP server" /></a>

## Quick Start (For Users)

To use this tool with Claude Desktop, add the following to your Claude Desktop configuration (`~/Library/Application Support/Claude/claude_desktop_config.json`):

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

This will automatically download and run the latest version with default settings.

## Features

- **Web Content Extraction**: Automatically extracts and formats web content as markdown
- **Article Title Extraction**: Extracts and displays the title of the article
- **Image Processing**: Optional processing of images from web pages with optimization
- **File Saving**: Images are saved to `~/Downloads/mcp-fetch/YYYY-MM-DD/` directory
- **Dual Output**: Both file saving and Base64 encoding for AI display (configurable)
- **JPEG Optimization**: Automatically optimizes images as JPEG for better performance
- **GIF Support**: Extracts first frame from animated GIFs
- **Security**: SSRF protection, robots.txt compliance, size limits, timeouts
- **Flexible Configuration**: Server-level configuration via CLI args and environment variables

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

Most configuration is done at the server level, not per-request. Configure via **CLI arguments** or **environment variables** in your MCP client config:

#### CLI Arguments

```json
{
  "mcpServers": {
    "fetch": {
      "command": "npx",
      "args": [
        "-y",
        "@kazuph/mcp-fetch",
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

**Text Processing:**
- `--text-start-index <number>` (default: 0)
- `--text-max-length <chars>` (default: 20000)

**Security:**
- `--ignore-robots-txt` (default: respect robots.txt)

#### Environment Variables

```json
{
  "mcpServers": {
    "fetch": {
      "command": "npx",
      "args": ["-y", "@kazuph/mcp-fetch"],
      "env": {
        "MCP_FETCH_IMAGE_OUTPUT": "both",
        "MCP_FETCH_IMAGE_LAYOUT": "merged",
        "MCP_FETCH_IMAGE_MAX_COUNT": "5",
        "MCP_FETCH_IMAGE_QUALITY": "85",
        "MCP_FETCH_TEXT_MAX_LENGTH": "50000"
      }
    }
  }
}
```

**Available Environment Variables:**

**Image Processing:**
- `MCP_FETCH_IMAGE_MAX_WIDTH` (pixels)
- `MCP_FETCH_IMAGE_MAX_HEIGHT` (pixels)
- `MCP_FETCH_IMAGE_QUALITY` (1-100)
- `MCP_FETCH_IMAGE_OUTPUT` (base64|file|both)
- `MCP_FETCH_IMAGE_LAYOUT` (merged|individual|both)
- `MCP_FETCH_IMAGE_ORIGIN_POLICY` (cross-origin|same-origin)
- `MCP_FETCH_IMAGE_START_INDEX` (number)
- `MCP_FETCH_IMAGE_MAX_COUNT` (0-10)

**Text Processing:**
- `MCP_FETCH_TEXT_START_INDEX` (number)
- `MCP_FETCH_TEXT_MAX_LENGTH` (characters)

**Security:**
- `MCP_FETCH_IGNORE_ROBOTS_TXT` (1 to ignore, unset to respect)
- `MCP_FETCH_TIMEOUT_MS` (milliseconds, default: 12000)
- `MCP_FETCH_MAX_REDIRECTS` (number, default: 3)
- `MCP_FETCH_MAX_HTML_BYTES` (bytes, default: 2000000)
- `MCP_FETCH_MAX_IMAGE_BYTES` (bytes, default: 10000000)
- `MCP_FETCH_DISABLE_SSRF_GUARD` (1 to disable, unset to enable)

#### Priority Order

Configuration is applied in this order (highest to lowest priority):
1. Per-request parameter (for the limited LLM-controlled params only)
2. CLI argument
3. Environment variable
4. Built-in default

### Common Configuration Scenarios

**Save images to files only (no base64 in response):**
```json
{
  "mcpServers": {
    "fetch": {
      "command": "npx",
      "args": ["-y", "@kazuph/mcp-fetch", "--image-output", "file"]
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
      "args": ["-y", "@kazuph/mcp-fetch", "--image-output", "both"]
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
        "-y", "@kazuph/mcp-fetch",
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
      "args": ["-y", "@kazuph/mcp-fetch", "--image-origin-policy", "same-origin"]
    }
  }
}
```

## For Developers

The following sections are for those who want to develop or modify the tool.

## Prerequisites

- Node.js 18+
- macOS (for clipboard operations)
- Claude Desktop (install from https://claude.ai/desktop)
- tsx (install via `npm install -g tsx`)

## Installation

```bash
git clone https://github.com/kazuph/mcp-fetch.git
cd mcp-fetch
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

## Configuration

1. Make sure Claude Desktop is installed and running.

2. Install tsx globally if you haven't:
```bash
npm install -g tsx
# or
pnpm add -g tsx
```

3. Modify your Claude Desktop config located at:
`~/Library/Application Support/Claude/claude_desktop_config.json`

You can easily find this through the Claude Desktop menu:
1. Open Claude Desktop
2. Click Claude on the Mac menu bar
3. Click "Settings"
4. Click "Developer"

Add the following to your MCP client's configuration:

```json
{
  "tools": {
    "imageFetch": {
      "args": ["tsx", "/path/to/mcp-fetch/index.ts"]
    }
  }
}
```

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
- **File Organization**: Images saved to `~/Downloads/mcp-fetch/YYYY-MM-DD/` with format `hostname_HHMMSS_index.jpg`
- **Tool Name**: Named `imageFetch` to avoid conflicts with native fetch functions

## Changelog

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
