#!/bin/bash

_issue_creator_completions() {
    local cur prev words cword
    _init_completion -n : || return

    cur="${COMP_WORDS[COMP_CWORD]}"
    prev="${COMP_WORDS[COMP_CWORD-1]}"
    words=("${COMP_WORDS[@]}")
    cword=$COMP_CWORD

    # Top-level commands
    if [[ $cword == 1 ]]; then
        opts="create cr update u list l config c help --version --help"
        COMPREPLY=( $(compgen -W "${opts}" -- "$cur") )
        return 0
    fi

    # Normalize command (support aliases)
    local main_cmd="${words[1]}"
    case "$main_cmd" in
        cr) main_cmd="create" ;;
        u)  main_cmd="update" ;;
        l)  main_cmd="list" ;;
        c)  main_cmd="config" ;;
    esac

    case "$main_cmd" in
        create|update|list)
            # Support --config/-c auto-completion with config names
            case "$prev" in
                --config|-c)
                    local configs=$(issue-creator config list 2>/dev/null | grep "Name:" | sed 's/Name: //')
                    COMPREPLY=( $(compgen -W "${configs}" -- "$cur") )
                    return 0
                    ;;
                --platform)
                    COMPREPLY=( $(compgen -W "github gitee" -- "$cur") )
                    return 0
                    ;;
                --state|-s)
                    [[ "$main_cmd" == "list" || "$main_cmd" == "update" ]] && COMPREPLY=( $(compgen -W "open closed all progressing" -- "$cur") )
                    return 0
                    ;;
                --owner|-o|--repo|-r|--title|-t|--description|-d|--labels|-l|--token|--number|-n)
                    return 0
                    ;;
                *)
                    local base_opts="--config -c --owner -o --repo -r --platform --token --help"
                    local extra_opts=""
                    [[ "$main_cmd" == "create" ]] && extra_opts="--title -t --description -d --labels -l"
                    [[ "$main_cmd" == "update" ]] && extra_opts="--number -n --title -t --description -d --labels -l --state -s"
                    [[ "$main_cmd" == "list" ]]   && extra_opts="--state -s"

                    COMPREPLY=( $(compgen -W "$base_opts $extra_opts" -- "$cur") )
                    return 0
                    ;;
            esac
            ;;
        config)
            local sub_cmd="${words[2]}"
            [[ "$sub_cmd" == "a" ]] && sub_cmd="add"
            [[ "$sub_cmd" == "r" ]] && sub_cmd="remove"
            [[ "$sub_cmd" == "l" ]] && sub_cmd="list"

            if [[ $cword == 2 ]]; then
                COMPREPLY=( $(compgen -W "add a list l remove r help" -- "$cur") )
                return 0
            fi

            case "$sub_cmd" in
                add)
                    case "$prev" in
                        --platform|-p)
                            COMPREPLY=( $(compgen -W "github gitee" -- "$cur") )
                            return 0
                            ;;
                        --name|-n|--owner|-o|--repo|-r|--token|-t)
                            return 0
                            ;;
                        *)
                            COMPREPLY=( $(compgen -W "--name -n --platform -p --owner -o --repo -r --token -t --help" -- "$cur") )
                            return 0
                            ;;
                    esac
                    ;;
                remove)
                    if [[ $cword == 3 ]]; then
                        local configs=$(issue-creator config list 2>/dev/null | grep "Name:" | sed 's/Name: //')
                        COMPREPLY=( $(compgen -W "${configs}" -- "$cur") )
                        return 0
                    fi
                    ;;
            esac
            ;;
    esac
}

complete -F _issue_creator_completions issue-creator

