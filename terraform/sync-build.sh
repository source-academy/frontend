#! /usr/bin/env bash

main() {
    if [ ! -z "$1" ]; then
        profile="--profile $1"
    fi
    aws s3 sync ../build <Insert S3 link here> ${profile}
    aws cloudfront create-invalidation --distribution-id <Insert CloudFront distribution id here> --paths /*
}

main $1
