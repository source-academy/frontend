#!/usr/bin/env bash

set -euo pipefail

./scripts/coverage-fix.sh do && \
  react-scripts-ts test --env=jsdom --coverage --coverageReporters=text-lcov | \
  coveralls
