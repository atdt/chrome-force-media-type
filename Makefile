CHROME := open /Applications/Google\ Chrome.app -n --args
CWD    := $(shell pwd)

all: package

package:
	$(CHROME) --pack-extension=$(CWD)/extension \
	    --pack-extension-key=$(CWD)/extension.pem --no-message-box
