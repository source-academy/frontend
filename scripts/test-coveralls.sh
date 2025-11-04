#!/usr/bin/env bash

set -euo pipefail

./scripts/coverage-fix.sh do && \
  yarn test --coverage --coverage.reporter=lcov \
    --coverage.exclude='**/src/features/game/**'
