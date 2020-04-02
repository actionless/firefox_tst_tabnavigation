#!/bin/sh
set -eu

XPI_NAME=tst_tabnavigation.xpi

if [ -f "$XPI_NAME" ] ; then
	rm "$XPI_NAME"
fi
7z a "$XPI_NAME" manifest.json background.js icons
