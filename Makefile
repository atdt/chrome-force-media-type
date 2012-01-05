EXTNAME := extension
KEYFILE := $(EXTNAME).pem
CRXFILE := $(EXTNAME).crx
EXTDIR  := $(EXTNAME)
SHELL   := /usr/bin/env bash
CHROME  := open /Applications/Google\ Chrome.app -n --args
CWD     := $(shell pwd)
SIZE    := $(shell wc -c <$(CRXFILE) | tr -d ' ')
VERSION := $(shell python -c "import json,sys;print json.loads(sys.stdin.read()).get('version','')" < $(EXTDIR)/manifest.json)
ZIPFILE := $(EXTNAME)-$(VERSION).zip

all: pack

pack:
	$(CHROME) --pack-extension=$(CWD)/extension \
	    --pack-extension-key=$(CWD)/extension.pem --no-message-box

upload:
	echo $(SIZE) $(VERSION)
