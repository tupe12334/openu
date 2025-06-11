#!/bin/sh

export GIT_AUTHOR_NAME="anon"
export GIT_AUTHOR_EMAIL="anon@users.noreply.github.com"
export GIT_COMMITTER_NAME="anon"
export GIT_COMMITTER_EMAIL="anon@users.noreply.github.com"

tree=$(git write-tree)
parent=$(git rev-parse HEAD 2>/dev/null || echo)
msg=$(cat "$1")

if [ -n "$parent" ]; then
  commit=$(echo "$msg" | git commit-tree "$tree" -p "$parent")
else
  commit=$(echo "$msg" | git commit-tree "$tree")
fi

git reset --soft "$commit"
exit 1
