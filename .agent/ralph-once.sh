#!/bin/bash
set -e

npm run agent:server
opencode run --attach http://localhost:4096/ "$(cat ./.agent/prompts/ralph.txt)"
