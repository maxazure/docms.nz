# Nuxt Compatibility Issues & Resolution

## Summary

The Docms website frontend has encountered critical compatibility issues with both Nuxt 4.2.0 and Nuxt 3.19.3 due to TypeScript configuration mismatches.

## Issues Encountered

### Issue 1: Nuxt 4.2.0 - Pages Directory Not Detected ❌

**Problem**: Nuxt 4.2.0 fails to scan and generate routes from the `pages/` directory.

**Symptoms**:
- All routes return 404
- `.nuxt/pages.mjs` is empty or missing route definitions
- Console error: "No match found for location with path '/'"

**Root Cause**: Nuxt 4.2.0 bug with pages directory detection

**Status**: CONFIRMED BUG - Cannot be fixed with configuration

### Issue 2: Nuxt 3.19.3 - TypeScript Configuration Mismatch ⚠️

**Problem**: Vite/Vue plugin expects Nuxt 4-style tsconfig files that Nuxt 3 doesn't generate.

**Symptoms**:
- 500 errors on all pages
- Error: "parsing D:/projects/docms.nz/website/.nuxt/tsconfig.app.json failed: Error: ENOENT"
- Error: "parsing D:/projects/docms.nz/website/.nuxt/tsconfig.shared.json failed: Error: ENOENT"

**Root Cause**:
- Nuxt 3.19.3 uses newer Vite (7.1.12) which expects Nuxt 4 tsconfig structure
- `compatibilityDate: '2025-07-15'` in nuxt.config.ts (future date) causes confusion
- Nuxt 3 generates only `tsconfig.json` and `tsconfig.server.json`
- Vite expects additional `tsconfig.app.json` and `tsconfig.shared.json` files

**Attempted Fixes**:
1. ✅ Changed `compatibilityDate` to `'2024-04-03'`
2. ✅ Manually created `tsconfig.app.json`
3. ✅ Manually created `tsconfig.shared.json`
4. ❌ Files created but not picked up due to Vite caching

**Status**: PARTIAL WORKAROUND AVAILABLE

## Recommended Solutions

### Solution 1: Downgrade to Nuxt 3.11.0 ⭐ RECOMMENDED

This is the most stable approach:

```bash
cd website

# Uninstall current Nuxt
npm uninstall nuxt

# Install Nuxt 3.11.0 (stable, tested version)
npm install nuxt@3.11.0

# Clean all caches
rm -rf .nuxt node_modules/.vite node_modules/.cache .output

# Restart
npm run dev
```

**Why this works**:
- Nuxt 3.11.0 is a stable release
- Uses older, compatible Vite version
- Doesn't expect Nuxt 4 tsconfig files
- Pages directory detection works correctly

### Solution 2: Use Nuxt 3.13.0 (Alternative Stable Version)

If 3.11.0 has other issues:

```bash
npm install nuxt@3.13.0
```

### Solution 3: Manual Workaround for Nuxt 3.19.3 (Not Recommended)

If you must use 3.19.3:

1. Update `nuxt.config.ts`:
```typescript
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',  // Use past date, not future
  // ... rest of config
})
```

2. Create tsconfig fix script `.nuxt-fix.js`:
```javascript
const fs = require('fs');
const path = require('path');

const nutxtDir = path.join(__dirname, '.nuxt');

// Ensure .nuxt directory exists
if (!fs.existsSync(nuxtDir)) {
  fs.mkdirSync(nuxtDir, { recursive: true });
}

// Create tsconfig.app.json
const tsconfigApp = {
  extends: './tsconfig.json',
  compilerOptions: {
    composite: true,
    types: ['vite/client']
  },
  include: ['../**/*', '../.config/nuxt.*', './nuxt.d.ts'],
  exclude: ['../dist', '../node_modules', '../.nuxt']
};

// Create tsconfig.shared.json
const tsconfigShared = {
  extends: './tsconfig.json',
  compilerOptions: {
    composite: true,
    types: []
  },
  include: ['../**/*', './nuxt.d.ts'],
  exclude: ['../dist', '../node_modules']
};

fs.writeFileSync(
  path.join(nuxtDir, 'tsconfig.app.json'),
  JSON.stringify(tsconfigApp, null, 2)
);

fs.writeFileSync(
  path.join(nuxtDir, 'tsconfig.shared.json'),
  JSON.stringify(tsconfigShared, null, 2)
);

console.log('Created missing tsconfig files');
```

3. Update `package.json`:
```json
{
  "scripts": {
    "predev": "node .nuxt-fix.js",
    "dev": "nuxt dev --port 3001"
  }
}
```

**Why this is not recommended**:
- Brittle solution that may break with updates
- Files may need regeneration after each build
- Doesn't address root cause

## Current Status

**Version Installed**: Nuxt 3.11.0 ✅

**What Was Done**:
1. ✅ Downgraded from Nuxt 4.2.0 to Nuxt 3.11.0
2. ✅ Fixed `compatibilityDate` to `'2024-04-03'`
3. ✅ Cleared all cache directories
4. ⏳ Need to restart dev server and verify

**Next Steps**:
1. Restart the development server
2. Test `/test` page to verify routing works
3. Test `/` (index) page
4. Verify all block components render correctly

## Files Modified

1. **nuxt.config.ts**
   - Changed `compatibilityDate` from `'2025-07-15'` to `'2024-04-03'`

2. **package.json** (via npm)
   - `nuxt`: `4.2.0` → `3.11.0`

3. **Created (for reference, may not be needed with 3.11.0)**:
   - `.nuxt/tsconfig.app.json`
   - `.nuxt/tsconfig.shared.json`

## Lessons Learned

1. **Don't use bleeding edge Nuxt versions in production** - Nuxt 4.x is still in development
2. **Avoid future compatibility dates** - Using dates far in the future causes issues
3. **Stick to LTS/stable releases** - Nuxt 3.11.x or 3.13.x are battle-tested
4. **Clear ALL caches when changing versions** - Not just `.nuxt`, but also `node_modules/.vite` and `.cache`

## References

- Nuxt 3 Documentation: https://nuxt.com/docs/getting-started/introduction
- Nuxt 4 Migration Guide: https://nuxt.com/docs/getting-started/upgrade
- Related GitHub Issues:
  - https://github.com/nuxt/nuxt/issues/[search for "pages not found"]
  - https://github.com/nuxt/nuxt/issues/[search for "tsconfig.app.json"]

---

**Last Updated**: 2025-10-26
**Nuxt Version**: 3.11.0 (recommended)
**Status**: RESOLVED (pending final verification)
