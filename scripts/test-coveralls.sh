#!/usr/bin/env bash

set -euo pipefail

./scripts/coverage-fix.sh do && \
  react-scripts test --coverage --coverageReporters=text-lcov | \
  coveralls
