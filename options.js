/*!
 * Open as Media Type Chrome Extension
 *
 * Copyright 2012, Ori Livneh
 * Licensed under the BSD license; see LICENSE for more details.
 */

/*jslint maxerr: 50, maxlen: 80, indent: 4 */
/*global chrome: true */

window.onload = function () {
    "use strict";

    var extratypes = localStorage.extratypes || '',
        alert = document.getElementById('alert'),
        button = document.getElementById('save'),
        textarea = document.getElementById('types');

    textarea.onfocus = function () {
        alert.classList.add('transparent');
    };

    button.onclick = function () {
        localStorage.extratypes = textarea.value;
        alert.classList.remove('transparent');
    };

    textarea.value = extratypes;
};
