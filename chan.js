/**
 * This file is part of 4chan Image Downloader, a helpful Chrome extension.
 * Authors: Jonathan Gregson.
 * License: GPLv3.
 * DL:https://chrome.google.com/webstore/detail/hahloifmmbcoaahbboegjcccniekbbib
 * Source: https://github.com/jdgregson/4chan-Image-Downloader
 */

// inject our download link
chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    // If the received message has the expected format...
    if (msg.text === 'report_back') {
        // Call the specified callback, passing
        // the web-page's DOM content as argument
        let imagenes = document.getElementsByClassName("fileText");
        let post = document.getElementsByClassName("subject");
        let number = document.getElementsByClassName("postNum")
        number = number[0].firstElementChild.nextElementSibling.innerText;
        var response = {};
        post = post[0];
        post = post.innerText.trim();
        if (post) {
        	response["name"] = post+"_"+number;
        } else {
        	response["name"] = number;
        }
        let images = []
        for(let i=0; i<imagenes.length; i++) {
        	images.push(imagenes[i].firstElementChild.href + " . " + imagenes[i].firstElementChild.innerText);
        }
        response["images"] = images;
        sendResponse(response);
    }
});