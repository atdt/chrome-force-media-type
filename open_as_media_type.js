/*!
 * Open as Media Type Chrome Extension
 *
 * Copyright 2012, Ori Livneh
 * Licensed under the BSD license; see LICENSE for more details.
 */

/*jslint maxerr: 50, maxlen: 80, indent: 4 */
/*global chrome: true */

(function () {
    "use strict";
    var headers_received = chrome.webRequest.onHeadersReceived,
        media_types = [
            // Handy list of media types:
            // http://en.wikipedia.org/wiki/Internet_media_type
            // TODO: make this customizable
            'text/html',
            'text/plain'
        ],
        parent_id = 0,    // id of topmost context-menu item
        target_tab = 0,
        target_url = '',
        patch_headers = function (media_type) {
            var callback = function (details) {
                var headers = details.responseHeaders,
                    is_redirect = false;

                if (details.tabId === target_tab) {
                    // this is the request we're meant to intercept; go ahead
                    // and patch headers
                    headers.forEach(function (header) {
                        switch (header.name.toLowerCase()) {
                        case 'content-type':
                            header.value = media_type;
                            break;
                        case 'content-disposition':
                            // see <http://tools.ietf.org/html/rfc2183>
                            header.value = 'inline';
                            break;
                        case 'location':
                            is_redirect = true;
                            target_url = header.value;
                            break;
                        }

                    });

                    headers_received.removeListener(patch_headers);

                    // if it's a redirect, re-add a listener, specifying the
                    // new url as the url filter
                    if (is_redirect) {
                        headers_received.addListener(
                            patch_headers(media_type),
                            {urls: [target_url]},
                            ['blocking', 'responseHeaders']
                        );
                    }
                }

                return {responseHeaders: headers};
            };
            return callback;
        },
        click_handler = function (media_type) {
            var handler = function (info) {
                // open the requested url in a new tab
                target_url = info.linkUrl;

                headers_received.addListener(
                    patch_headers(media_type),
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
    parent_id = chrome.contextMenus.create({
        title: "Open as media type\u2026",
        contexts: ['link']
    });

    media_types.forEach(function (media_type) {
        chrome.contextMenus.create({
            title: media_type,
            contexts: ['link'],
            parentId: parent_id,
            onclick: click_handler(media_type)
        });
    });
}());
