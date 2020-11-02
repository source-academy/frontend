#!/usr/bin/env bash

set -euo pipefail

TEMPFILE="$(mktemp)"

./scripts/coverage-fix.sh do && \
  craco test --coverage --coverageReporters=text-lcov \
    --collectCoverageFrom='!**/src/features/game/**' > "$TEMPFILE"
coveralls < "$TEMPFILE" || echo "Warning: Coveralls upload failed"
