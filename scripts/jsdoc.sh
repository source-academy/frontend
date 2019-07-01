#! /usr/bin/env bash

SOURCEFOLDERS="public/externalLibs/sound"
JSDOC="node_modules/.bin/jsdoc"

main() {
    # make sure we are in the git root
    if [[ $(git rev-parse --show-toplevel 2> /dev/null) = "$PWD" ]]; then
        run
    else
        echo "Please run this command from the git root directory."
        false  # exit 1
    fi
}

run() {

    ${JSDOC} -r -d doc/jsdoc ${SOURCEFOLDERS} 

}

main $1
