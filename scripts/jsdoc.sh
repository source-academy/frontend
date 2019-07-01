#! /usr/bin/env bash

JSDOC="node_modules/.bin/jsdoc"
TMPL="doc/jsdoc/templates/template"

main() {

    if [ "$1" == "install" ]; then
	install
    elif [[ $(git rev-parse --show-toplevel 2> /dev/null) = "$PWD" ]]; then
        run
    else
        echo "Please run this command from the git root directory."
        false  # exit 1
    fi
}

run() {

    # SOUND
    
    ${JSDOC} -r -t ${TMPL} \
	     -d doc/jsdoc/libraries/SOUND \
	     -R public/externalLibs/sound/README.md \
	     public/externalLibs/sound

    # RUNES
    
    ${JSDOC} -r -t ${TMPL} \
	     -d doc/jsdoc/libraries/RUNES \
	     -R public/externalLibs/graphics/README.md \
	     public/externalLibs/graphics/webGLrune.js

}

install() {

    cd doc/jsdoc

    scp -r libraries sicp@web1.comp.nus.edu.sg:public_html; echo "visit https://sicp.comp.nus.edu.sg/libraries to see all is good"

}

main $1
