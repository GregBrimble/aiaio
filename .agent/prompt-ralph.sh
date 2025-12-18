#!/bin/bash
set -e

if [ -z "$1" ]; then
  echo "Usage: $0 <prompt>"
  exit 1
fi

opencode run --attach http://localhost:4096/ "@prd.json \
Convert my feature requirements into structured PRD items. \
Each item should have: category, description, steps to verify, and passes: false. \
Format as JSON. Be specific about acceptance criteria. \
$1"
