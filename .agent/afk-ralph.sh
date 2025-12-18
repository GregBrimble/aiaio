#!/bin/bash
set -e

if [ -z "$1" ]; then
  echo "Usage: $0 <iterations>"
  exit 1
fi

npm run agent:server

for ((i=1; i<=$1; i++)); do
  result=$(opencode run --attach http://localhost:4096/ "$(cat ./.agent/prompts/ralph.txt) \
If the PRD is complete, output <promise>COMPLETE</promise>.")

  echo "$result"

  if [[ "$result" == *"<promise>COMPLETE</promise>"* ]]; then
    echo "PRD complete after $i iterations."
    exit 0
  fi
done
