#! /usr/bin/env bash

SOUNDFOLDER="public/externalLibs/sound"
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

    ${JSDOC} -r -d doc/jsdoc/SOUND -c doc/jsdoc/conf.json -t doc/jsdoc/templates/template -R public/externalLibs/sound/README.md ${SOUNDFOLDER} 

}

main $1
