#!/bin/bash

echo "deploying..."

# version=$(git describe --abbrev=0 --tags)
# if [ "$version" = "" ]; then
#     echo "read git version fail"
#     exit 1
# fi
version="1.0.0"
echo "version: $version"
if [ ! -z $1 ] && [ "$1" == 'rebuild' ]; then
    rm -f builded.lock oss.lock template.lock
fi

if [ ! -f "builded.lock" ]; then
    current=$(date "+%Y-%m-%d %H:%M:%S")
    buildTime=$(date -d "$current" +%s)
    sed -i "s/\"version\":.*$/\"version\":\"$version\",/" package.json
    sed -i "s/\"buildTime\":.*$/\"buildTime\":\"$buildTime\",/" package.json
    yarn build
    if [ $? -eq "0" ]; then
        touch builded.lock
    fi
    
    sleep 2
fi

if [ ! -f "oss.lock" ]; then
    oss-upload ./dist dist/
    if [ $? -eq "0" ]; then
        touch oss.lock
    fi
fi

if [ ! -f "template.lock" ]; then
    file=$(<./dist/index.html)
    content=$(printf "%s""$file" | base64 | tr -d "\n")
    token=$(/media/roger/98B2D1FBB2D1DE36/workspace/api-equ/api-equ sign -i sign -e 10)
    res=$(curl -s -X POST -H "'Content-type':'application/json'" -d '{"name":"control","content":"'"$content"'","token":"'"$token"'","version":"'"$version"'"}' http://192.168.1.232:5024/v3/patch/control-template)
    if [ "$res" == "{}" ]; then
        echo "lock"
        # touch template.lock
    fi
fi
