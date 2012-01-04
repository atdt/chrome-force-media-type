/*jslint maxerr: 50, maxlen: 80, indent: 4 */
/*global chrome: true */
(function () {
    "use strict";
    var headers_received = chrome.webRequest.onHeadersReceived,
        target_tab = 0,   // tab where request will be opened
        target_url = '',  // url to be opened
        patch_headers = function (mimetype) {
            var callback = function (details) {
                var headers = details.responseHeaders,
                    is_redirect = false;

                if (details.tabId === target_tab) {
                    // this is the request we're meant to intercept; go ahead
                    // and patch headers
                    console.log(headers);
                    headers.forEach(function (header) {
                        switch (header.name.toLowerCase()) {
                        case 'content-type':
                            header.value = mimetype;
                            break;
                        case 'content-disposition':
                            // see <http://tools.ietf.org/html/rfc2183>
                            header.value = 'inline';
                            break;
                        case 'status':
                            // handle redirects
                            if (/^30[1237]/.test(header.value)) {
                                console.log("redirect!");
                                is_redirect = true;
                            }
                            break;
                        case 'location':
                            is_redirect = true;
                            console.log("redirect (via location)!");
                            target_url = header.value;
                            break;
                        }

                    });

                    headers_received.removeListener(patch_headers);

                    // if it's a redirect, re-add a listener, specifying the
                    // new url as the url filter
                    if (is_redirect) {
                        headers_received.addListener(
                            patch_headers(mimetype),
                            {urls: [target_url]},
                            ['blocking', 'responseHeaders']
                        );
                    }
                }

                return {responseHeaders: headers};
            };
            return callback;
        },
        click_handler = function (mimetype) {
            var handler = function (info) {
                // open the requested url in a new tab
                target_url = info.linkUrl;

                headers_received.addListener(
                    patch_headers(mimetype),
                    {urls: [target_url]},
                    ['blocking', 'responseHeaders']
                );

                chrome.tabs.create({url: target_url}, function (tab) {
                    target_tab = tab.id;
                });
            };
            return handler;
        };

    //
    // context menu items
    // 
    chrome.contextMenus.create({
        title: 'Open Link as text/html',
        contexts: ['link'],
        onclick: click_handler("text/html")
    });
}());
