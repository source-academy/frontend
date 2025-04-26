#!/usr/bin/env bash

set -euo pipefail

./scripts/coverage-fix.sh do && \
  yarn test --coverage --coverageReporters=text-lcov \
    --collectCoverageFrom='!**/src/features/game/**' > lcov.info
