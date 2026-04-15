#!/usr/bin/env bash
set -o errexit

python -m pip install --upgrade pip
python -m pip install pipenv

npm install
npm run build

pipenv install
pipenv run upgrade
