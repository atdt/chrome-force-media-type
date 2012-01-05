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
