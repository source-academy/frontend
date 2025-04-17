#! /usr/bin/env bash

DIR_TO_LOOK="./src"

main() {
    # make sure we are in the git root
    if [[ $(git rev-parse --show-toplevel 2> /dev/null) = "$PWD" ]]; then
        if [ "$1" == "do" ]; then
            do_change
        elif [ "$1" == "undo" ]; then
            undo_change
        else
            echo "Specify 'do' or 'undo' as argument"
        fi
    else
        echo "Please run this command from the git root directory."
        false  # exit 1
    fi
}

do_change() {
    # local variables in this function:
    #   tsd_files: string[] - filenames of *.d.ts
    #    ts_files: string[] - filenames of tsd_files converted as *.ts
    # note that .coverage-fix.tmp is used to keep track of *.ts files that need
    # to be renamed back to *.d.ts
    local tsd_files=( `find "$DIR_TO_LOOK" -name "*.d.ts"` )
    local ts_files=( `printf '%s\n' "${tsd_files[@]}" | sed -e "s/.d.ts/.ts/g"` )
    printf '%s\n' "${ts_files[@]}" > .coverage-fix.tmp
    local number_files=`cat .coverage-fix.tmp | wc -l`

    # because printf %s\n is used to generage .coverage-fix.tmp,
    # an empty array of ts_files still generates wc -l -> 1
    # in this case, mv will receive 2 empty arguments "", throwing an error
    # to avoid, detect if .coverage-fix.tmp has only one character \n
    if [[ `cat .coverage-fix.tmp | wc -m` -ne 1 ]]; then
        local last_index=$(( number_files - 1 ))
        for i in $(seq 0 $last_index); do
            echo Renaming "${tsd_files[$i]}" as "${ts_files[$i]}"...
            mv "${tsd_files[$i]}" "${ts_files[$i]}"
        done
    fi
}

undo_change() {
    local ts_files=( `cat .coverage-fix.tmp` )
    local tsd_files=( `printf '%s\n' "${ts_files[@]}" | sed -e "s/.ts/.d.ts/g"` )
    local number_files=`cat .coverage-fix.tmp | wc -l`

    if [[ `cat .coverage-fix.tmp | wc -m` -ne 1 ]]; then
        local last_index=$(( number_files - 1 ))
        for i in $(seq 0 $last_index); do
            echo Renaming "${ts_files[$i]}" as "${tsd_files[$i]}"...
            mv "${ts_files[$i]}" "${tsd_files[$i]}"
        done
    fi

    rm .coverage-fix.tmp
}

main $1
