#! /usr/bin/env bash

JSDOC="node_modules/.bin/jsdoc"
TMPL="doc/jsdoc/templates/template"

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

    # SOUND
    
    ${JSDOC} -r -t ${TMPL} \
	     -d doc/jsdoc/SOUND \
	     -R public/externalLibs/sound/README.md \
	     public/externalLibs/sound

    # RUNES
    
    ${JSDOC} -r -t ${TMPL} \
	     -d doc/jsdoc/RUNES \
	     -R public/externalLibs/graphics/README.md \
	     public/externalLibs/graphics/webGLrune.js

}

main $1
