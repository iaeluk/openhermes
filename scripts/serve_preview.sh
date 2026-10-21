#!/bin/bash
# Serve a prévia clicável do layout openhermes no localhost.
cd "$(dirname "$0")/../preview" || exit 1
python3 -m http.server 8917 --bind 127.0.0.1
