// ==UserScript==
// @name         Trello scripts
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://trello.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    var tag = document.createElement("script");
	tag.src = "http://localhost:8080/loader.js"
	document.getElementsByTagName("head")[0].appendChild(tag);
    var scripts = $('script[type="text/javascript"]')
    console.log("Found scripts: ", scripts)
})();