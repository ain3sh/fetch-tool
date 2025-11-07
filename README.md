# Deep-Fetch MCP Tool

**Web fetching that handles what built-in tools can't**: images, clean markdown extraction, and organized file management—configured once at the server level, not in every prompt.

> Fork of [kazuph/mcp-fetch](https://github.com/kazuph/mcp-fetch) with LLM-friendly configuration improvements.

## Why Deep Fetch?

Built-in fetch tools in AI assistants are limited:
- **No image handling** (Claude Code, Aider)
- **No file saving** (most tools)
- **Can't handle JavaScript-rendered sites**
- **LLMs negotiate settings on every request**

Deep Fetch adds:
- **Image pipeline**: Fetch, resize, optimize, merge, and save automatically
- **Clean markdown**: Mozilla Readability + Turndown for article extraction
- **Organized storage**: Date-based directories for saved content
- **Server-level config**: Set quality/dimensions once—LLMs just provide URLs

## Installation

### Option 1: Direct from GitHub (Recommended)
No installation needed - runs directly via `npx`:

```bash
npx -y github:ain3sh/fetch-tool
```

### Option 2: Clone Locally
For development or customization:

```bash
git clone https://github.com/ain3sh/fetch-tool.git
cd fetch-tool
npm install && npm run build
```

## Usage

### For CLI Agents (Claude Code, Factory Droid, etc.)

Add to `.mcp.json` in your project root:

```json
{
  "mcpServers": {
    "deep-fetch": {
      "type": "stdio",
      "command": "npx",
      "args": [
        "-y",
        "github:ain3sh/fetch-tool",
        "--image-output", "both",        // Save files AND show in response
        "--image-quality", "90",          // JPEG quality (1-100)
        "--image-max-count", "10",        // Max images to fetch
        "--text-max-length", "50000"      // Max text length
      ]
    }
  }
}
```

**Common Configurations:**

```json
// High-quality image archival
"args": [
  "-y", "github:ain3sh/fetch-tool",
  "--image-output", "file",       // Save only, no base64
  "--image-quality", "95",
  "--image-max-width", "2000",
  "--image-max-height", "3000"
]

// Quick preview mode
"args": [
  "-y", "github:ain3sh/fetch-tool",
  "--image-output", "base64",     // Display only, no saving
  "--image-quality", "70",
  "--image-max-count", "3"
]

// Documentation fetching
"args": [
  "-y", "github:ain3sh/fetch-tool",
  "--text-max-length", "100000",
  "--image-max-count", "0"        // Text only
]
```

### For Claude Desktop

Add to `~/Library/Application Support/Claude/claude_desktop_config.json`:

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

Or with custom settings:

```json
{
  "mcpServers": {
    "fetch": {
      "command": "npx",
      "args": [
        "-y", 
        "github:ain3sh/fetch-tool",
        "--image-output", "both",
        "--image-quality", "85"
      ]
    }
  }
}
```

## Features

- **Smart Content Extraction**: Readability algorithm for clean article text
- **Image Processing**: Resize, optimize, convert to JPEG with configurable quality
- **File Management**: Saves to `~/Downloads/deep-fetch/YYYY-MM-DD/` (configurable)
- **Dual Output**: Both file saving and Base64 encoding for display
- **Security**: SSRF protection, robots.txt compliance, size limits
- **Cross-Platform**: Works on Linux, macOS, and Windows

## Configuration Reference

### Tool Parameters (LLM-Controlled)

Minimal parameters exposed to LLMs:

```json
// Simple fetch
{ "url": "https://example.com" }

// With images
{ "url": "https://example.com", "images": true }

// Custom save location
{ "url": "https://example.com", "images": { "saveDir": "/path/to/project" } }

// Raw HTML instead of markdown
{ "url": "https://example.com", "text": { "raw": true } }
```

### Server Configuration (CLI Arguments)

Set once when configuring the server:

#### Image Processing
- `--image-output <base64|file|both>` - Output format (default: base64)
- `--image-quality <1-100>` - JPEG quality (default: 80)
- `--image-max-width <pixels>` - Max width (default: 1000)
- `--image-max-height <pixels>` - Max height (default: 4000)
- `--image-max-count <0-10>` - Max images to fetch (default: 3)
- `--image-layout <merged|individual|both>` - How to combine images (default: merged)
- `--image-origin-policy <cross-origin|same-origin>` - Image source policy (default: cross-origin)

#### Text Processing
- `--text-max-length <chars>` - Maximum text length (default: 20000)
- `--text-start-index <number>` - Starting index for pagination (default: 0)

#### General
- `--default-save-dir <path>` - Base directory for saved files (default: ~/Downloads/deep-fetch)
- `--ignore-robots-txt` - Bypass robots.txt checks

### Environment Variables

For infrastructure/security settings:

```json
"env": {
  "DEEP_FETCH_DEFAULT_SAVE_DIR": "/tmp/deep-fetch",
  "DEEP_FETCH_TIMEOUT_MS": "15000",              // Request timeout
  "DEEP_FETCH_MAX_REDIRECTS": "5",               // Max HTTP redirects
  "DEEP_FETCH_MAX_HTML_BYTES": "5000000",        // Max HTML size (5MB)
  "DEEP_FETCH_MAX_IMAGE_BYTES": "10000000"       // Max image size (10MB)
}
```

## Common Use Cases

### Research & Documentation
```json
"args": ["-y", "github:ain3sh/fetch-tool", "--text-max-length", "100000", "--image-max-count", "20"]
```

### Social Media Archival
```json
"args": ["-y", "github:ain3sh/fetch-tool", "--image-output", "both", "--image-quality", "95"]
```

### Quick Content Preview
```json
"args": ["-y", "github:ain3sh/fetch-tool", "--image-output", "base64", "--image-max-count", "3"]
```

## What's New in v2.0.0

- **Simplified Interface**: LLMs only see essential parameters (`url`, `images`, `text`)
- **Server-Level Config**: Image quality, dimensions, etc. configured once via CLI args
- **Better Defaults**: Works great out-of-the-box
- **Direct GitHub Usage**: Run via `npx` without installation

## Development

### Building from Source
```bash
git clone https://github.com/ain3sh/fetch-tool.git
cd fetch-tool
npm install
npm run build
npm start -- --image-quality 90  # Test with arguments
```

### Security Features
- SSRF protection (blocks private IPs)
- Respects robots.txt by default
- Request timeouts and size limits
- Manual redirect validation

## Attribution

Fork of [mcp-fetch](https://github.com/kazuph/mcp-fetch) by [kazuph](https://github.com/kazuph).

**License**: MIT  
**Fork maintained by**: [ain3sh](https://github.com/ain3sh)
