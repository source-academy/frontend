#! /usr/bin/env bash

main() {
    if [ ! -z "$1" ]; then
        profile="--profile $1"
    fi
    aws s3 sync ../build s3://stg-cadet-frontend ${profile}
}

main $1
