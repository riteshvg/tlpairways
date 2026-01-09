# SPA Deprecation Plan

**Status**: 🟡 **DEPRECATED - ARCHIVE PHASE**  
**Date**: 2026-01-09  
**Decision**: Migrate to MPA architecture (Next.js)

---

## Current Status

### ✅ MPA (Active - Production)
- **Location**: `/frontend-next`
- **Framework**: Next.js 14
- **Status**: Production-ready, deployed on Railway
- **Running**: 69+ hours continuously
- **Features**: All core booking flow, authentication, analytics

### 🟡 SPA (Deprecated - Archive)
- **Location**: `/frontend`
- **Framework**: React 18 (Create React App)
- **Status**: Deprecated, not in active use
- **Last Active**: Before MPA migration
- **Purpose**: Legacy reference only

---

## Deprecation Timeline

### ✅ Phase 0: Migration Complete (DONE)
- [x] MPA architecture implemented
- [x] All pages migrated to Next.js
- [x] Production deployment switched to MPA
- [x] Adobe Data Layer working in MPA
- [x] Authentication working in MPA

### 🔄 Phase 1: Archive (Current - Week 1)
**Goal**: Preserve SPA code for reference without active use

**Actions**:
- [ ] Create `archive/spa-legacy` Git branch
- [ ] Add `ARCHIVED.md` marker in `/frontend`
- [ ] Update main README to reflect MPA as primary
- [ ] Remove SPA from active development scripts
- [ ] Clean up `frontend/build/` and `frontend/node_modules/`

**Commands**:
```bash
# Create archive branch
git checkout -b archive/spa-legacy
git push origin archive/spa-legacy

# Mark as archived
echo "# ARCHIVED - Legacy SPA Code

This directory contains the legacy Single Page Application (React + Create React App) code.

**Status**: Deprecated  
**Archived**: 2026-01-09  
**Reason**: Migrated to Next.js MPA architecture  
**Archive Branch**: archive/spa-legacy  

## Why Archived?
- Adobe Analytics tracking issues (race conditions)
- SEO limitations
- Large bundle size (576KB)
- Complex state management

## Replacement
See \`/frontend-next\` for the new Next.js MPA implementation.

## Reference
- Migration docs: \`/documentation/MPA_TRANSITION_SUMMARY.md\`
- Architecture comparison: \`/documentation/SPA_VS_MPA_ARCHITECTURE.md\`
" > frontend/ARCHIVED.md

git add frontend/ARCHIVED.md
git commit -m "docs: Mark SPA as archived"
git push
```

### 📦 Phase 2: Move to Archive Folder (Week 2-4)
**Goal**: Organize codebase, reduce clutter

**Actions**:
- [ ] Verify MPA stability (2 weeks in production)
- [ ] Create `/archive` directory
- [ ] Move `/frontend` → `/archive/frontend-spa-legacy`
- [ ] Update any remaining references
- [ ] Test that MPA still works

**Commands**:
```bash
# After 2 weeks of stable MPA
mkdir -p archive
mv frontend archive/frontend-spa-legacy
git add .
git commit -m "chore: Move legacy SPA to archive folder"
git push
```

### 🗑️ Phase 3: Complete Removal (Month 2-3)
**Goal**: Clean up codebase completely

**Prerequisites**:
- ✅ MPA stable for 1+ month in production
- ✅ No rollback incidents
- ✅ Team fully comfortable with Next.js
- ✅ All SPA components ported or replaced
- ✅ No references to SPA in active code

**Actions**:
- [ ] Final review of archived code
- [ ] Confirm archive branch is pushed
- [ ] Remove `/archive/frontend-spa-legacy`
- [ ] Update documentation

**Commands**:
```bash
# Final cleanup (after 1-2 months)
rm -rf archive/frontend-spa-legacy
git add .
git commit -m "chore: Remove archived SPA code"
git push
```

---

## What to Keep vs Remove

### ✅ KEEP (Permanently)
- `/frontend-next` (MPA - active)
- `/backend` (API server)
- Documentation about migration
- Git history (archive branch)

### 📦 KEEP (Temporarily - Archive Phase)
- `/frontend` → `/archive/frontend-spa-legacy`
- SPA documentation (for reference)
- Component patterns (for porting ideas)

### ❌ REMOVE (Immediately)
- `/frontend/build/` (build artifacts)
- `/frontend/node_modules/` (dependencies - 800MB+)
- SPA-specific CI/CD configs

### 🔄 UPDATE (Immediately)
- `README.md` - Reflect MPA as primary
- `package.json` - Remove SPA scripts
- `start-dev.sh` - Update to use MPA
- `.gitignore` - Add archive patterns

---

## Files to Update

### 1. Root README.md
```markdown
# TLAirways - Flight Booking Platform

**Architecture**: Multi-Page Application (Next.js 14)  
**Status**: Production

## Quick Start
\`\`\`bash
./start-mpa.sh
\`\`\`

## Architecture
- **Frontend**: Next.js 14 (\`/frontend-next\`)
- **Backend**: Express.js (\`/backend\`)
- **Legacy**: React SPA (archived in \`/archive\`)
```

### 2. package.json
Remove:
```json
{
  "scripts": {
    "start:spa": "cd frontend && npm start",  // REMOVE
    "build:spa": "cd frontend && npm run build"  // REMOVE
  }
}
```

### 3. start-dev.sh
Update to use MPA instead of SPA:
```bash
FRONTEND_DIR="frontend-next"  # Changed from "frontend"
```

---

## Rollback Plan (Emergency Only)

If critical issues arise with MPA:

### Option 1: Revert Deployment
```bash
# Restore SPA from archive branch
git checkout archive/spa-legacy -- frontend/
git checkout archive/spa-legacy -- railway.json

# Update railway.json to deploy SPA
# Deploy to Railway
```

### Option 2: Parallel Deployment
- Deploy SPA to different Railway service
- Use DNS to switch traffic
- Fix MPA issues
- Switch back to MPA

---

## Benefits of Deprecation

### For Development
- ✅ Cleaner codebase
- ✅ Reduced confusion (one architecture)
- ✅ Faster CI/CD (no SPA builds)
- ✅ Less maintenance burden

### For Performance
- ✅ Smaller repository size
- ✅ Faster git operations
- ✅ Reduced deployment size

### For Team
- ✅ Clear direction (Next.js)
- ✅ No context switching
- ✅ Focused learning

---

## Migration Checklist

### Code Migration
- [x] Homepage
- [x] Search page
- [x] Results page
- [x] Traveller details
- [x] Ancillary services
- [x] Payment page
- [x] Confirmation page
- [x] Profile page
- [x] About page
- [x] Settings page

### Features Migration
- [x] Authentication (Auth0)
- [x] Adobe Analytics
- [x] Consent management
- [x] Email notifications
- [x] Booking flow
- [x] Adobe Target personalization

### Infrastructure
- [x] Railway deployment
- [x] Environment variables
- [x] API integration
- [x] Session management

---

## Decision Log

### Why Deprecate SPA?

**Technical Issues**:
1. Adobe Data Layer race conditions
2. SEO limitations (JS-dependent)
3. Large bundle size (576KB gzipped)
4. Complex state management
5. Slow initial load (3-5s)

**Business Drivers**:
1. Better analytics reliability
2. Improved SEO for organic traffic
3. Faster page loads (better UX)
4. Modern architecture (Next.js)
5. Easier maintenance

**Decision Date**: 2025-12 (based on conversation history)  
**Stakeholders**: Development team  
**Alternatives Considered**: 
- Fix SPA issues (rejected - too complex)
- Vanilla HTML (rejected - lose React)
- Remix (rejected - smaller community)

---

## References

- [SPA vs MPA Architecture Comparison](./SPA_VS_MPA_ARCHITECTURE.md)
- [MPA Migration Summary](./MPA_TRANSITION_SUMMARY.md)
- [MPA Migration Checklist](./MPA_MIGRATION_CHECKLIST.md)
- [Adobe Data Layer MPA Progress](./ADOBE_DATALAYER_MPA_PROGRESS.md)

---

**Last Updated**: 2026-01-09  
**Status**: 🟡 Phase 1 (Archive)  
**Next Review**: 2026-01-23 (2 weeks)
