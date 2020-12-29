#!/bin/bash

echo "deploying..."

version=$(git describe --abbrev=0 --tags)
if [ "$version" = "" ]; then
    echo "read git version fail"
    exit 1
fi

# lastVersion=$(<lastVersion.lock)
# if [ "$version" != "$lastVersion" ]; then
#     read -r -p "$lastVersion => $version Are You Sure? [Y/n] " input

#     case $input in
#     [yY][eE][sS] | [yY])
#         rm -f builded.lock oss.lock template.lock
#         ;;

#     [nN][oO] | [nN])
#         exit 1
#         ;;

#     *)
#         exit 1
#         ;;
#     esac
# fi

# version="1.0.0"
echo "version: $version"
# if [ ! -z $1 ] && [ "$1" == 'rebuild' ]; then
#     rm -f builded.lock oss.lock template.lock
# fi

# if [ ! -f "builded.lock" ]; then
#     current=$(date "+%Y-%m-%d %H:%M:%S")
#     buildTime=$(date -d "$current" +%s)
#     sed -i "s/\"version\":.*$/\"version\":\"$version\",/" package.json
#     sed -i "s/\"buildTime\":.*$/\"buildTime\":\"$buildTime\",/" package.json
#     yarn build
#     if [ $? -eq "0" ]; then
#         touch builded.lock
#     fi
#     sed -i "s/<base .*><title>/<title>/" dist/index.html
#     sleep 2
# fi

# if [ ! -f "oss.lock" ]; then
#     oss-upload ./dist dist/
#     if [ $? -eq "0" ]; then
#         touch oss.lock
#     fi
# fi

if [ ! -f "template.lock" ]; then
    file=$(<./dist/index.html)
    content=$(printf "%s""$file" | base64 | tr -d "\n")
    token="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2MDkyMzQ1NzcsImlzcyI6InNpZ24ifQ.yKhoWQyahEs5N44PayOVIxCULSgEB4XQNGGifidPiss"
    res=$(curl -s -X POST -H "'Content-type':'application/json'" -d '{"name":"control","content":"'"$content"'","token":"'"$token"'","version":"'"$version"'"}' https://api-equ.signp.cn/v3/template-update)
    echo "$res"
    if [ "$res" == "{}" ]; then
        touch template.lock
        echo "$version" > lastVersion.lock
    fi
fi
echo "finished"