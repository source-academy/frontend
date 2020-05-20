#! /usr/bin/env bash

main() {
    git submodule init
    git submodule update --remote
}

main