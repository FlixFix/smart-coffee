#!/bin/bash

read_line() {
   local file="$1"
       local search_string="$2"
       local delimiter="="

       local lines=()

       while IFS= read -r line; do
           lines+=("$line")
       done < "$file"

       for line in "${lines[@]}"; do
           if [[ $line == *"$search_string"* ]]; then
               content=${line#*$delimiter}
               echo "$content"
               return
           fi
       done
}

fronend_env="./frontend/.env"
deploy_time=$(date '+%F_%H:%M:%S')

major_version=$(read_line $fronend_env "MAJOR_VERSION")
minor_version=$(read_line $fronend_env "MINOR_VERSION")
hotfix_version=$(read_line $fronend_env "HOTFIX_VERSION")

echo "The current version is MAJOR: $major_version - MINOR: $minor_version HOTFIX: $hotfix_version"

# check how this script is run: hotfix - minor - major
deployment_type=$1

if [[ $deployment_type == "major" ]]; then
  echo 'This is a major version update...'
  ((major_version++))
  minor_version=$((0))
  hotfix_version=$((0))
elif [[ $deployment_type == "minor" ]]; then
  echo 'This is a minor version update...'
  ((minor_version++))
  hotfix_version=$((0))
elif [[ $deployment_type == "hotfix" ]]; then
    echo 'This is a hotfix version update...'
    ((hotfix_version++))
else
  echo 'Invalid input parameter! - Aborting...'
fi

echo "The new version will be MAJOR: $major_version - MINOR: $minor_version HOTFIX: $hotfix_version"
echo "Writing version to files..."
sed -i '' "1s/.*/REACT_APP_APP_MAJOR_VERSION=$major_version/" $fronend_env &&
sed -i '' "2s/.*/REACT_APP_APP_MINOR_VERSION=$minor_version/" $fronend_env &&
sed -i '' "3s/.*/REACT_APP_APP_HOTFIX_VERSION=$hotfix_version/" $fronend_env &&
sed -i '' "4s/.*/REACT_APP_APP_BUILD_TIME=$deploy_time/" $fronend_env &&

echo "Successfully wrote new version and build time to file!"
echo 'building frontend ...'
cd ./frontend && npm run build &&
echo 'building frontend done!'

echo 'copying backend to homepod...'
cd .. &&
rsync -arv --exclude './backend/.env' ./backend homepod@192.168.178.146:/var/www/coffee-hub/ &&

echo 'copying frontend static to homepod...'
rsync -arv ./frontend/build homepod@192.168.178.146:/var/www/coffee-hub/frontend &&

echo 'Creating tag and pushing to origin'
TAG_NAME="release_$major_version.$minor_version.$hotfix_version"

# Create a new tag and commit it
git tag "$TAG_NAME" &&
git commit -am "Released version $major_version.$minor_version.$hotfix_version" &&
git push origin "$TAG_NAME"


echo 'starting application...'
op read op://Private/Homepod/password | ssh -t Homepod "sudo -S systemctl restart coffee-hub.service"

