#!/bin/bash

# Dev Docker
if [ "$1" == "up" ]; then
  docker compose -f compose.dev.yaml up -d $2
elif [ "$1" == "down" ]; then
  docker compose -f compose.dev.yaml down $2
else
  echo "Usage: $0 up|down"
fi
