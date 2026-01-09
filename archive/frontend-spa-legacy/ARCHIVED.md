# ARCHIVED - Legacy SPA Code

This directory contains the legacy Single Page Application (React + Create React App) code.

**Status**: Deprecated  
**Archived**: 2026-01-09  
**Reason**: Migrated to Next.js MPA architecture  

## Why Archived?
- Adobe Analytics tracking issues (race conditions)
- SEO limitations
- Large bundle size (576KB)
- Complex state management

## Replacement
See `/frontend-next` for the new Next.js MPA implementation.

## Reference
- Migration docs: `/documentation/MPA_TRANSITION_SUMMARY.md`
- Architecture comparison: `/documentation/SPA_VS_MPA_ARCHITECTURE.md`
- Deprecation plan: `/documentation/SPA_DEPRECATION_PLAN.md`

## Contents
This archive contains:
- React SPA source code (`src/`)
- Public assets (`public/`)
- Configuration files
- Package dependencies manifest

**Note**: `node_modules/` and `build/` directories have been removed to save space.

