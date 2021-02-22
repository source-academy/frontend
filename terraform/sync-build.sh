#! /usr/bin/env bash

main() {
    if [ ! -z "$1" ]; then
        profile="--profile $1"
    fi
    aws s3 sync --delete --exclude '*.wasm' ${profile} ../build <Insert S3 link here>
    aws s3 sync --exclude '*' --include '*.wasm' --content-type 'application/wasm' ${profile} ../build <Insert S3 link here>
    aws cloudfront create-invalidation --distribution-id <Insert CloudFront distribution id here> --paths /*
}

main $1
