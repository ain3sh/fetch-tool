# Deep-Fetch v2.0.0: Complete Rebrand with Clean Configuration Architecture

## 🎯 Overview

This PR transforms `mcp-fetch` into `deep-fetch` with major architectural improvements for LLM-friendly configuration and a cleaner, more maintainable codebase.

**Key Achievement**: Reduced LLM-visible parameters from 15+ to just 3, while adding more powerful server-level configuration.

---

## 🔥 Breaking Changes

### Rebranding
- **Server name**: `mcp-fetch` → `deep-fetch`
- **Tool name**: `imageFetch` → `fetch`
- **Package**: `@ain3sh/mcp-fetch` → `@ain3sh/deep-fetch`
- **Binary**: `mcp-fetch` → `deep-fetch`
- **Env vars**: All `MCP_FETCH_*` → `DEEP_FETCH_*`
- **Default save**: `~/Downloads/mcp-fetch` → `~/Downloads/deep-fetch`

### Configuration Architecture
- **Environment Variables**: Now limited to 6 infrastructure settings only
- **CLI Arguments**: All user-facing settings (image/text processing)
- **Clean Separation**: No duplication, clear boundaries

---

## ✨ New Features

### 1. Default Save Directory Configuration
```bash
# CLI argument
--default-save-dir /custom/path

# Environment variable
DEEP_FETCH_DEFAULT_SAVE_DIR=/custom/path

# Per-request override (LLM can set)
{ "images": { "saveDir": "/project/docs" } }
```

**Implementation**:
- Added `imageSaveDir` to `ServerConfig`
- Wired through entire pipeline (merged & individual images)
- Per-request override now actually works (was TODO before!)

### 2. Clean Args/Env Separation

**CLI Arguments** (User-Facing):
- Image processing: `--image-quality`, `--image-max-width`, `--image-output`, etc.
- Text processing: `--text-max-length`, `--text-start-index`
- Save directory: `--default-save-dir`
- Security: `--ignore-robots-txt`

**Environment Variables** (Infrastructure, 6 total):
- `DEEP_FETCH_DEFAULT_SAVE_DIR` - Base save directory
- `DEEP_FETCH_TIMEOUT_MS` - HTTP timeout
- `DEEP_FETCH_MAX_REDIRECTS` - Redirect limit
- `DEEP_FETCH_MAX_HTML_BYTES` - Max HTML size
- `DEEP_FETCH_MAX_IMAGE_BYTES` - Max image size
- `DEEP_FETCH_DISABLE_SSRF_GUARD` - SSRF protection toggle

**Removed**: All duplicate env vars for image/text settings

### 3. Fact-Checked Documentation

**Researched and verified claims about competitor tools**:

**Claude Code's WebFetch** (verified from official docs):
- ✅ Fetches text and PDFs
- ❌ No image fetching
- ❌ No file saving
- ❌ Cannot handle JS-rendered sites

**Cursor's @Web**: Search-focused, manual image handling

**Aider's /web**: Text scraping only, no images

**This tool's unique capabilities**:
- Complete image pipeline (fetch → optimize → merge → save)
- Mozilla Readability + Turndown for clean markdown
- Organized file management with date-based directories
- Server-level config (LLMs don't waste tokens on quality settings)

---

## 📝 Commits

1. **`349b757`** - feat: move configuration from tool params to server-level CLI args and env vars
   - Core v2.0.0 architecture
   - Moved 12+ parameters to server config
   - Simplified tool interface

2. **`104af2a`** - docs: update all documentation for v2.0.0 fork
   - Complete README rewrite
   - RELEASE_NOTES_v2.0.0.md
   - Updated CLAUDE.md

3. **`eee86aa`** - docs: fact-check and improve README comparison section
   - Researched actual capabilities of built-in tools
   - Removed misleading claims
   - Honest, accurate positioning

4. **`84f497b`** - docs: add comprehensive PR message template
   - Added PR_MESSAGE.md for reference

5. **`b9347d2`** - feat: rebrand to deep-fetch with clean args/env separation
   - Complete rebrand to deep-fetch
   - Implemented clean args/env separation
   - Added default save directory feature
   - Updated all documentation

---

## 📊 Code Changes

**Summary**:
- 6 files changed
- 1,273 insertions(+), 569 deletions(-)

**Key Files**:
- `index.ts`: Core implementation with clean config separation
- `package.json`: Rebranded to @ain3sh/deep-fetch
- `README.md`: Complete documentation rewrite
- `CLAUDE.md`: Updated development guide
- `CONTRIBUTING.md`: New contribution guidelines
- `RELEASE_NOTES_v2.0.0.md`: Comprehensive release notes

---

## 🎨 Example Configuration

```json
{
  "mcpServers": {
    "deep-fetch": {
      "command": "npx",
      "args": [
        "-y", "github:ain3sh/fetch-tool",

        // Image Processing (CLI args)
        "--image-output", "both",
        "--image-quality", "80",
        "--image-max-count", "15",
        "--image-max-width", "2500",
        "--image-max-height", "2500",

        // Text Processing (CLI args)
        "--text-max-length", "25000"
      ],
      "env": {
        // Security & Infrastructure (env vars only)
        "DEEP_FETCH_DEFAULT_SAVE_DIR": "/tmp/deep-fetch",
        "DEEP_FETCH_TIMEOUT_MS": "15000",
        "DEEP_FETCH_MAX_HTML_BYTES": "5000000"
      }
    }
  }
}
```

---

## ✅ Testing

- ✅ **Build**: Clean TypeScript compilation, no errors
- ✅ **Server**: Starts successfully with example config
- ✅ **Env Separation**: Only 6 security env vars supported
- ✅ **CLI Args**: All image/text settings work correctly
- ✅ **Save Dir**: Default and per-request overrides working
- ✅ **Type Safety**: Full type coverage maintained

---

## 🎯 Value Proposition

**For Users**: Configure image quality once at server startup, never think about it again

**For LLMs**: Three simple parameters (`url`, `images`, `text`) instead of fifteen

**For Maintainers**: Clear separation of concerns, no duplicate config paths

**For Documentation**: Honest, fact-checked comparisons with competitors

---

## 📌 Migration Guide

### From v1.x (kazuph/mcp-fetch)

**1. Update package reference:**
```bash
# Old
npx -y @kazuph/mcp-fetch

# New
npx -y github:ain3sh/fetch-tool
```

**2. Update config key:**
```json
// Old
"mcp-fetch": { ... }

// New
"deep-fetch": { ... }
```

**3. Move parameters to CLI args:**
```json
// Old (v1.x) - LLM had to set every time
{
  "url": "...",
  "imageQuality": 80,
  "imageMaxWidth": 1000,
  // ... 12 more params
}

// New (v2.0) - Set once at server level
"args": ["--image-quality", "80", "--image-max-width", "1000"]
```

**4. Update env vars (if used):**
```bash
# Old
MCP_FETCH_IMAGE_QUALITY=80

# New (use CLI args instead!)
--image-quality 80
```

---

## 🚀 Ready to Merge

All changes tested and verified. This PR represents a complete v2.0.0 release with:
- Cleaner architecture
- Better documentation
- LLM-friendly interface
- Fact-checked claims
- Professional branding

**Merged PRs will work immediately via**: `npx -y github:ain3sh/fetch-tool`
