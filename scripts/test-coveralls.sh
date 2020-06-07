#!/usr/bin/env bash

set -euo pipefail

./scripts/coverage-fix.sh do && \
  craco test --coverage --coverageReporters=text-lcov | \
  coveralls
