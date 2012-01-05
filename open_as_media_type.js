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
        media_types = ['text/html', 'text/plain'],
        target_tab = 0,
        target_url = '',
        patch_headers = function (media_type) {
            var callback = function (details) {
                var headers = details.responseHeaders,
                    is_redirect = false;

                if (details.tabId === target_tab) {
                    // This is the request we want to intercept: the tab IDs
                    // and request URLs match.
                    headers.forEach(function (header) {
                        switch (header.name.toLowerCase()) {
                        case 'content-type':
                            header.value = media_type;
                            break;
                        case 'content-disposition':
                            // See <http://tools.ietf.org/html/rfc2183>
                            header.value = 'inline';
                            break;
                        case 'location':
                            is_redirect = true;
                            target_url = header.value;
                            break;
                        }
                    });
                    headers_received.removeListener(patch_headers);
                    // If it's a redirect, re-add a listener, specifying the
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
            // Handle a context menu item click
            var handler = function (info) {
                // Open the requested url in a new tab
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
        },
        uniquify = function (array) {
            // Remove duplicate items from array
            return array.filter(function (val, i) {
                return i === array.indexOf(val);
            });
        },
        build_menus = function () {
            // Create right-click context menu items
            var extra_types = (localStorage.extra_types || '').split('\n'),
                types = uniquify(media_types.concat(extra_types)),
                parent_id;

            parent_id = chrome.contextMenus.create({
                title: "Open as media type\u2026",
                contexts: ['link']
            });

            types.forEach(function (media_type) {
                chrome.contextMenus.create({
                    title: media_type,
                    contexts: ['link'],
                    parentId: parent_id,
                    onclick: click_handler(media_type)
                });
            });
        },
        options_updated_handler = function (e) {
            // Listen to StorageEvents and update menus as necessary
            if (e.key === 'extra_types' && e.newValue !== e.oldValue) {
                chrome.contextMenus.removeAll(build_menus);
            }
        };
    build_menus();
    window.addEventListener('storage', options_updated_handler);
}());
