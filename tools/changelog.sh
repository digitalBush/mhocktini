#!/bin/bash
gh_url=$(gh repo view --json url -q ".url")
prev_tag=$(git describe --tags --abbrev=0)
new_version=$(npm pkg get version|xargs)
new_log=$(git log --pretty="- %s ([%h]($gh_url/commit/%H))" $prev_tag..)

echo "## $new_version ($(date +"%Y-%m-%d"))

$new_log

$(cat CHANGELOG.md)" > CHANGELOG.md

git add CHANGELOG.md
