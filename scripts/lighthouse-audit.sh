#!/bin/bash

# Lighthouse Accessibility Audit Script
# This script runs Lighthouse audits on key pages of the application

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
BASE_URL="${1:-http://localhost:3000}"
OUTPUT_DIR="lighthouse-reports"
MIN_SCORE=90

# Create output directory
mkdir -p "$OUTPUT_DIR"

echo -e "${GREEN}Starting Lighthouse Accessibility Audits${NC}"
echo "Base URL: $BASE_URL"
echo "Output Directory: $OUTPUT_DIR"
echo "Minimum Score: $MIN_SCORE"
echo ""

# Check if lighthouse is installed
if ! command -v lighthouse &> /dev/null; then
    echo -e "${RED}Error: Lighthouse is not installed${NC}"
    echo "Install it with: npm install -g lighthouse"
    exit 1
fi

# Check if the server is running
if ! curl -s "$BASE_URL" > /dev/null; then
    echo -e "${RED}Error: Server is not running at $BASE_URL${NC}"
    echo "Start the server with: pnpm dev"
    exit 1
fi

# Array of pages to test
declare -a pages=(
    "/:homepage"
    "/shop:shop"
    "/cart:cart"
    "/login:login"
    "/register:register"
    "/blog:blog"
)

# Function to run lighthouse audit
run_audit() {
    local path=$1
    local name=$2
    local url="${BASE_URL}${path}"
    local output="${OUTPUT_DIR}/${name}"
    
    echo -e "${YELLOW}Testing: $url${NC}"
    
    lighthouse "$url" \
        --only-categories=accessibility \
        --output=html \
        --output=json \
        --output-path="$output" \
        --chrome-flags="--headless" \
        --quiet
    
    # Extract accessibility score from JSON
    local score=$(cat "${output}.report.json" | grep -o '"accessibility":[0-9.]*' | grep -o '[0-9.]*$')
    local score_percent=$(echo "$score * 100" | bc | cut -d. -f1)
    
    if [ "$score_percent" -ge "$MIN_SCORE" ]; then
        echo -e "${GREEN}✓ $name: $score_percent/100 (PASS)${NC}"
    else
        echo -e "${RED}✗ $name: $score_percent/100 (FAIL - minimum is $MIN_SCORE)${NC}"
    fi
    
    echo ""
}

# Run audits for all pages
for page in "${pages[@]}"; do
    IFS=':' read -r path name <<< "$page"
    run_audit "$path" "$name"
done

echo -e "${GREEN}Audits complete!${NC}"
echo "View detailed reports in the $OUTPUT_DIR directory"
echo ""
echo "To view a report, open: $OUTPUT_DIR/[page-name].report.html"
