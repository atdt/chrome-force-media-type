EXTNAME := force-media-type
KEYFILE := $(EXTNAME).pem
CRXFILE := $(EXTNAME).crx
EXTDIR  := $(EXTNAME)
SHELL   := /usr/bin/env bash
CHROME  := open /Applications/Google\ Chrome.app -n --args
CWD     := $(shell pwd)
SIZE    := $(shell wc -c <$(CRXFILE) | tr -d ' ')
VERSION := $(shell python -c "import json,sys;print json.loads(sys.stdin.read()).get('version','')" < $(EXTDIR)/manifest.json)
ZIPFILE := $(EXTNAME)-$(VERSION).crx

GITHUB_USERNAME   := atdt
GITHUB_PASSWORD   := 1nov1983
GITHUB_REPOSITORY := chrome-open-as-media-type  # make this $(EXTNAME)?

all: pack

pack:
	$(CHROME) --pack-extension=$(CWD)/extension \
	    --pack-extension-key=$(CWD)/extension.pem --no-message-box

zipball:
	zip $(EXTNAME)-$(VERSION) extension/*

upload:
	echo $(SIZE) $(VERSION)
	curl -v \
	    -u "$(GITHUB_USERNAME):$(GITHUB_PASSWORD)" \
	    -d '{"name": "$(ZIPFILE)", "size": "$(SIZE)", "description": "Version $(VERSION)"}' \
	    https://api.github.com/repos/$(GITHUB_USERNAME)/$(GITHUB_REPOSITORY)/downloads
