#!/bin/bash

set -e

cd $GITHUB_WORKSPACE

# Generate meta
npm start

# Push
git add .
git config user.name "${GITHUB_ACTOR}"
git config user.email "${GITHUB_ACTOR}@users.noreply.github.com"
git commit -m "chore: generate metadata for ${GITHUB_SHA}" || true
git push origin $CURRENT_BRANCH