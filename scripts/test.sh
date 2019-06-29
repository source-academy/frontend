#! /usr/bin/env bash

export CI=true

main() {
    run_cmd "git stash push --keep-index --message precommit"
    echo "  If you cancel this pre-push hook, use \`git stash pop\` to retrieve your"
    echo "  unstaged changes."

    prettier="npm run format:ci"
    jest_ts="npm test"

    run_cmd "${prettier}"; prettier_exit=$?
    run_cmd_jest "${jest_ts}"; jest_ts_exit=$?

    run_cmd "git stash pop"

    ( >&2
        echo -ne "\033[0;31m"
        [ "${prettier_exit}" -eq "0" ] || echo "Prettier failed"
        [ "${jest_ts_exit}" -eq "0" ] || echo "Jest failed"
        echo -ne "\033[0m"
    )

    [[ $(( prettier_exit + jest_ts_exit )) -eq "0" ]]
}

run_cmd() {
    echo_cyan "> $1"

    print=$($1 2>&1 1> /dev/null)
    exit_status=$?
    if [[ ! -z "${print}" ]]; then
        echo "${print}" | sed 's/^/  /'
    fi

    return "${exit_status}"
}

run_cmd_jest() {
    # modified run_cmd for jest, because jest prints all messages to stderr
    echo_cyan "> $1"

    print=$($1 2>&1 1> /dev/null)
    exit_status=$?
    echo -n "${print}" | grep -v PASS | grep -v -E ^$ | sed 's/^/  /'

    return "${exit_status}"
}

echo_cyan() {
    echo -ne "\033[0;36m"
    echo "$1"
    echo -ne "\033[0m"
}

main
