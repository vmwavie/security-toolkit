#!/usr/bin/env bash

CRE=$(tput setaf 1)
CYE=$(tput setaf 3)
CGR=$(tput setaf 2)
CBL=$(tput setaf 4)
BLD=$(tput bold)
CNC=$(tput sgr0)

username=$(whoami)
backup_folder=~/.ricebkp
date=$(date +%Y%m%d-%H%M%S)

logo () {
local text="${1:?}"
printf '%s%s%s%s%s%s%s' "${CRE}" "${BLD}"
printf "\n"
echo "         / .------. \         "
echo "          .--------.          "
echo "        / /        \ \        "
echo "        | |        | |        "
echo "       _| |________| |_       "
echo "     .' |_|        |_| '.     "
echo "     '._____ ____ _____.'     "
echo "     |     .'____'.     |     "
echo "     '.__.'.'    '.'.__.'     "
echo "     '.__  |      |  __.'     "
echo "     |   '.'.____.'.'   |     "
echo "     '.____'.____.'____.'     "
echo "     '.________________.'     "
printf "\n"
printf '%s%s%s%s%s%s%s' "${CRE}" "${text}"
}


logo "Welcome ${username}!"

printf '\n%s%sYou wanna to proceed with this? This process should publish the security-toolkit to npm.%s\n\n' "${BLD}" "${CRE}" "${CNC}"

while true; do
	read -rp "Do you wish to continue? [y/N]: " yn
		case $yn in
			[Yy]* ) break;;
			[Nn]* ) exit;;
			* ) printf " Error: just write 'y' or 'n'\n\n";;
		esac
    done
clear

mkdir temporary-folder
npm run build
sleep 10
mv dist/* temporary-folder/
cp package.json temporary-folder/
git add .
git commit -m "[build]: update build of the project"
git push
sleep 10
cd temporary-folder/
npm publish
sleep 10
rm -rf temporary-folder/

logo "The process has been completed successfully!"
