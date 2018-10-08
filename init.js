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
        let imagenes = document.getElementsByClassName("post_file_filename");
        let post = document.getElementsByClassName("post_data");
        var response = {};
        post = post[0];
        let number = document.URL.split("/");
        number = number[number.indexOf("thread") + 1];
        post = post.querySelector(".post_title");
        if (post) {
            post = post.innerText.trim();
            if (post.length > 0) {
                response["name"] = post+"_"+number;
            } else {
                response["name"] = number;
            }
        } else {
            response["name"] = number;
        }
        let images = []
        for(let i=0; i<imagenes.length; i++) {
            if (imagenes[i].hasAttribute("title")) {
                images.push(imagenes[i].href + " . " + imagenes[i].title);
            } else {
                images.push(imagenes[i].href + " . " + imagenes[i].innerText);
            }
        }
        response["images"] = images;
        sendResponse(response);
    }
});