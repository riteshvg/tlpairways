#!/bin/bash

# cleanup-legacy-code.sh
# Safely removes legacy SPA code and creates backup

set -e  # Exit on error

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  TLP Airways - Legacy Code Cleanup Script                 ║${NC}"
echo -e "${BLUE}║  Removes old SPA code after MPA migration                  ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check if we're in the right directory
if [ ! -d "frontend-next" ] || [ ! -d "backend" ]; then
    echo -e "${RED}❌ Error: Must run from project root directory${NC}"
    exit 1
fi

# Check for uncommitted changes
if ! git diff-index --quiet HEAD --; then
    echo -e "${YELLOW}⚠️  Warning: You have uncommitted changes${NC}"
    echo -e "${YELLOW}   Please commit or stash them first${NC}"
    exit 1
fi

echo -e "${YELLOW}📋 This script will:${NC}"
echo -e "  1. Create a backup branch (archive/spa-legacy)"
echo -e "  2. Remove the following directories and files:"
echo -e "     - ${RED}frontend/${NC} (React SPA - 112 files)"
echo -e "     - ${RED}frontend-nextjs/${NC} (Empty/incomplete)"
echo -e "     - ${RED}start-dev.sh${NC} (SPA startup script)"
echo -e "     - ${RED}start-dev.bat${NC} (Windows SPA script)"
echo -e "     - ${RED}start-simple.sh${NC} (Simple SPA script)"
echo -e "  3. Create a rollback script in case you need to undo"
echo ""

# Confirmation
read -p "$(echo -e ${YELLOW}Continue with cleanup? [y/N]:${NC} )" -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${RED}❌ Cleanup cancelled${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}Step 1: Creating backup branch${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"

# Get current branch
CURRENT_BRANCH=$(git branch --show-current)
echo -e "Current branch: ${YELLOW}$CURRENT_BRANCH${NC}"

# Create backup branch
BACKUP_BRANCH="archive/spa-legacy-$(date +%Y%m%d)"
echo -e "Creating backup branch: ${YELLOW}$BACKUP_BRANCH${NC}"

git checkout -b "$BACKUP_BRANCH"
git push origin "$BACKUP_BRANCH" || echo -e "${YELLOW}⚠️  Could not push backup branch (will be local only)${NC}"

# Return to original branch
git checkout "$CURRENT_BRANCH"

echo -e "${GREEN}✅ Backup branch created: $BACKUP_BRANCH${NC}"
echo ""

echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}Step 2: Removing legacy files${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"

# Create a list of files to be removed (for rollback script)
REMOVED_FILES_LOG=".cleanup-removed-files.log"
echo "# Files removed by cleanup-legacy-code.sh on $(date)" > "$REMOVED_FILES_LOG"

# Function to safely remove and log
safe_remove() {
    local path=$1
    if [ -e "$path" ]; then
        echo "$path" >> "$REMOVED_FILES_LOG"
        echo -e "  ${RED}✗${NC} Removing: $path"
        git rm -rf "$path" 2>/dev/null || rm -rf "$path"
    else
        echo -e "  ${YELLOW}⊘${NC} Not found: $path (skipping)"
    fi
}

# Remove directories
safe_remove "frontend"
safe_remove "frontend-nextjs"

# Remove old startup scripts
safe_remove "start-dev.sh"
safe_remove "start-dev.bat"
safe_remove "start-simple.sh"

echo ""
echo -e "${GREEN}✅ Legacy files removed${NC}"
echo ""

echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}Step 3: Creating rollback script${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"

# Create rollback script
ROLLBACK_SCRIPT="rollback-cleanup.sh"
cat > "$ROLLBACK_SCRIPT" << 'EOF'
#!/bin/bash
# Auto-generated rollback script
# Run this to undo the cleanup

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${YELLOW}║  Rollback Script - Restoring Legacy Code                  ║${NC}"
echo -e "${YELLOW}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

BACKUP_BRANCH="BACKUP_BRANCH_PLACEHOLDER"
CURRENT_BRANCH=$(git branch --show-current)

echo -e "Current branch: ${YELLOW}$CURRENT_BRANCH${NC}"
echo -e "Backup branch: ${YELLOW}$BACKUP_BRANCH${NC}"
echo ""

read -p "$(echo -e ${YELLOW}Restore legacy code from backup? [y/N]:${NC} )" -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${RED}❌ Rollback cancelled${NC}"
    exit 1
fi

echo -e "${GREEN}Checking out files from backup branch...${NC}"
git checkout "$BACKUP_BRANCH" -- frontend/ frontend-nextjs/ start-dev.sh start-dev.bat start-simple.sh 2>/dev/null || true

echo ""
echo -e "${GREEN}✅ Rollback complete!${NC}"
echo -e "${YELLOW}Note: Files are restored but not committed. Review and commit if needed.${NC}"
EOF

# Replace placeholder with actual backup branch name
sed -i.bak "s/BACKUP_BRANCH_PLACEHOLDER/$BACKUP_BRANCH/" "$ROLLBACK_SCRIPT"
rm "${ROLLBACK_SCRIPT}.bak"

chmod +x "$ROLLBACK_SCRIPT"

echo -e "${GREEN}✅ Rollback script created: ${YELLOW}$ROLLBACK_SCRIPT${NC}"
echo ""

echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}Step 4: Summary${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"

echo ""
echo -e "${GREEN}✅ Cleanup Complete!${NC}"
echo ""
echo -e "${YELLOW}What was done:${NC}"
echo -e "  • Backup branch created: ${YELLOW}$BACKUP_BRANCH${NC}"
echo -e "  • Legacy files removed (see ${YELLOW}$REMOVED_FILES_LOG${NC})"
echo -e "  • Rollback script created: ${YELLOW}$ROLLBACK_SCRIPT${NC}"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo -e "  1. ${BLUE}Test your application locally:${NC}"
echo -e "     ./start-mpa.sh"
echo -e ""
echo -e "  2. ${BLUE}If everything works, commit the changes:${NC}"
echo -e "     git add -A"
echo -e "     git commit -m 'chore: Remove legacy SPA code after MPA migration'"
echo -e ""
echo -e "  3. ${BLUE}If something breaks, rollback:${NC}"
echo -e "     ./$ROLLBACK_SCRIPT"
echo -e ""
echo -e "${YELLOW}⚠️  DO NOT push to origin until you've tested locally!${NC}"
echo ""
