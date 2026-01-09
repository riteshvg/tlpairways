# Archive Directory

This directory contains deprecated/legacy code that is no longer actively used in production.

## Contents

### `frontend-spa-legacy/`
**Archived**: 2026-01-09  
**Original Location**: `/frontend`  
**Technology**: React 18 + Create React App (SPA)  
**Status**: Deprecated

**Why Archived**:
- Migrated to Next.js MPA architecture (`/frontend-next`)
- Adobe Analytics tracking issues (race conditions)
- SEO limitations
- Large bundle size (576KB gzipped)

**Replacement**: `/frontend-next` (Next.js 14 MPA)

**Note**: `node_modules/` (1.3GB) and `build/` (2.7MB) directories have been removed to save space.

## Restoration

If you need to restore the SPA for reference:

```bash
# Install dependencies
cd archive/frontend-spa-legacy
npm install

# Run development server
npm start
```

## Removal Timeline

- **Phase 1** (Current): Moved to archive folder
- **Phase 2** (Week 2-4): Verify MPA stability
- **Phase 3** (Month 2-3): Complete removal if no issues

See `/documentation/SPA_DEPRECATION_PLAN.md` for full timeline.

---

**Last Updated**: 2026-01-09
