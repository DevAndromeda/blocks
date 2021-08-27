#!/bin/bash

set -eo pipefail

cd $GITHUB_WORKSPACE

# Generate meta
echo "::[notice] # Generate global Metadata"
npm start

# cool stuff
REPO="https://${GITHUB_ACTOR}:${GITHUB_TOKEN}@github.com/${GITHUB_REPOSITORY}.git"

# Push
echo "::[notice] # Commit and push"
git add .
git config user.name "${GITHUB_ACTOR}"
git config user.email "${GITHUB_ACTOR}@users.noreply.github.com"
git commit -m "chore: generate metadata for ${GITHUB_SHA}" || true
git push origin $CURRENT_BRANCH