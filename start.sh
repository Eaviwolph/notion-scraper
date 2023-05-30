#!/bin/sh

if [ ! -d node_modules ] ; then
  echo "node-modules does not exist"
  yarn install
fi

export NOTION_DATABASE_ID_LEARNINGS=1ddba9742f774f94862bba26353fa3ec
export NOTION_DATABASE_ID_STUDENTS=1378c199b5e048ff85a78e3140f1f693
export NOTION_DATABASE_ID_COURSES=678d0188294b4d4bb30231ff5a851c2a
export NOTION_DATABASE_ID_PROOFS=ae8d0dda243448ac85e4b9b579e3a4c0

export NOTION_KEY=$1

yarn start
