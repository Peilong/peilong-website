#!/usr/bin/env bash
# SessionStart hook (see .claude/settings.json) that readies a Claude Code on the web (cloud) copy of
# this repo to build: the Academic theme at the commit this repo pins, and Hugo 0.66.0 (non-extended).
# It mirrors .github/workflows/scheduled-publish.yml. On a local machine it does nothing, because
# CLAUDE_CODE_REMOTE is only set in cloud sessions. Safe to run repeatedly.
set -uo pipefail

[ "${CLAUDE_CODE_REMOTE:-}" = "true" ] || exit 0

HUGO_VERSION=0.66.0
repo="${CLAUDE_PROJECT_DIR:-$(cd "$(dirname "$0")/.." && pwd)}"
cd "$repo" || exit 0

fail() {
  echo "cloud-setup: $1"
  echo "cloud-setup: if this is a network block, set the environment's network access to Full on claude.ai/code."
  exit 0
}

# 1. Theme at the pinned commit (the cloud clone may not check out submodules).
if [ ! -f themes/academic/theme.toml ]; then
  sha=$(git ls-tree HEAD themes/academic | awk '{print $3}')
  [ -n "$sha" ] || fail "could not read the pinned theme commit"
  rm -rf themes/academic && mkdir -p themes/academic
  curl -fsSL "https://codeload.github.com/gcushen/hugo-academic/tar.gz/${sha}" \
    | tar xz --strip-components=1 -C themes/academic \
    || fail "theme download failed"
  echo "cloud-setup: theme ready (${sha:0:7})"
fi

# 2. Hugo 0.66.0, checksum verified.
if ! hugo version 2>/dev/null | grep -q "v${HUGO_VERSION}"; then
  case "$(uname -m)" in
    x86_64) arch=64bit ;;
    aarch64|arm64) arch=ARM64 ;;
    *) fail "no Hugo ${HUGO_VERSION} build for $(uname -m)" ;;
  esac
  pkg="hugo_${HUGO_VERSION}_Linux-${arch}.tar.gz"
  base="https://github.com/gohugoio/hugo/releases/download/v${HUGO_VERSION}"
  tmp=$(mktemp -d)
  (
    cd "$tmp" &&
    curl -fsSLO "${base}/${pkg}" &&
    curl -fsSLO "${base}/hugo_${HUGO_VERSION}_checksums.txt" &&
    grep " ${pkg}\$" "hugo_${HUGO_VERSION}_checksums.txt" | sha256sum -c - >/dev/null &&
    tar xzf "$pkg" hugo
  ) || fail "Hugo ${HUGO_VERSION} download or checksum failed"

  bin="${CLOUD_SETUP_BIN:-/usr/local/bin}"
  if ! { [ -w "$bin" ] && mv "$tmp/hugo" "$bin/hugo"; }; then
    bin="$HOME/.local/bin"
    mkdir -p "$bin" && mv "$tmp/hugo" "$bin/hugo" || fail "could not install Hugo"
    # Make the new PATH stick for the rest of the session's commands.
    [ -n "${CLAUDE_ENV_FILE:-}" ] && echo "export PATH=\"$bin:\$PATH\"" >> "$CLAUDE_ENV_FILE"
  fi
  rm -rf "$tmp"
  echo "cloud-setup: Hugo ${HUGO_VERSION} installed in $bin"
fi
exit 0
