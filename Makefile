CHROME=open /Applications/Google\ Chrome.app -n --args

all: package

package:
	$(CHROME) --pack-extension=extension --pack-extension-key=mediatype.mem
