/**
 * This file is part of 4chan Image Downloader, a helpful Chrome extension.
 * Authors: Jonathan Gregson.
 * License: GPLv3.
 * DL:https://chrome.google.com/webstore/detail/hahloifmmbcoaahbboegjcccniekbbib
 * Source: https://github.com/jdgregson/4chan-Image-Downloader
 */

/**
 * confirmDownload(count) will inform the user of the risks and ask them if they
 * would like to download count images.
 * @param  {Integer} count - number of images to be downloaded
 * @return {Boolean} - whether or not to start the download
 */
 function confirmDownload(count) {
   let msg = 'Are you sure you want to download all images in this thread? ' +
   'There are ' + count + ' images to download.\n\n It may slow down your ' +
   'browser while the downloads are in progress.\n\n You may be prompted to ' +
   'allow the downloads at the top of the page a few times.';
   return confirm(msg);
 }

 function sleep(milliseconds) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds){
      break;
    }
  }
}

var urlRegex = /^https?:\/\/((?:[^./?#]+\.)?fireden\.net|desuarchive\.org|archived\.moe|nyafuu\.org|thebarchive\.com|archiveofsins\.com|4archive\.org|yuki\.la)\/\w{1,3}\/thread\/\w*/;
var urlRegexD = /^https?:\/\/((?:[^./?#]+\.)?fireden\.net|desuarchive\.org|archived\.moe|nyafuu\.org|thebarchive\.com|archiveofsins\.com|4archive\.org|yuki\.la)\//;
var pest;
var tries = 0;
var failed = 0;
var toResume = [];
var currentDownload = false;

function downloadSequentially(urls,name, callback) {
  let index = 0;
  let currentId;

  chrome.downloads.onChanged.addListener(onChanged);
  chrome.notifications.create({
    "type": "basic",
    "iconUrl": chrome.extension.getURL("images/icon48.png"),
    "title": "Start",
    "message": "To Download: " + urls.length
  });

  next();

  function next() {
    if (index >= urls.length) {
      chrome.downloads.onChanged.removeListener(onChanged);
      chrome.notifications.create({
        "type": "basic",
        "iconUrl": chrome.extension.getURL("images/icon48.png"),
        "title": "End",
        "message": "Ended downloads\nTotal of images: " + urls.length +"\nDownloads failed: " + failed  
      });
      callback();
      return;
    }
    const url = urls[index];
    index++;
    if (url) {
    	var downloadUrl = url.split(" . ")[0];
      var img = url.split(" . ")[1];
      img = img.replace(/[\/:*?"~<>|!]/g, "");
      name = name.replace(/[\/:*?"~<>|!]/g, "_");
      console.log(name+"/"+img);
      chrome.downloads.download({
        url: downloadUrl,
        filename: name+"/"+img,
        conflictAction: 'uniquify',
      }, id => {
        currentId = id;
      });
    }
  }

  function onChanged({id, state, error}) {
    if (id === currentId && state && state.current !== 'in_progress' && !error) {
      tries = 0;
      console.log(state.current);
      next();
    } else {
      if (id == currentId && error) {
        if(tries < 20) {
          tries = tries + 1;
          chrome.downloads.resume(id);
        } else {
          tries = 0;
          failed = failed + 1;
          chrome.downloads.cancel(id);
          next();
        }
      }
    }
  }
}

/**
 * downloadImages(confirmed) will perform the download of the entire thread.
 * @param  {Boolean} confirmed - whether or not to treat this call as pre-
 *   confirmed and bypass the user's confirmation
 */
 function downloadImages(response) {
   var confirmed=false;
   cont = 0;
   if (response["name"]) {
    var name = response["name"];
  } else {
    var name = pest.split("/")
    name = name[name.indexOf("thread") + 1]
  }
  let images = response["images"];
  downloadSequentially(images, name, () => console.log('done'));
}

chrome.browserAction.onClicked.addListener(function(tab) { 
	// ...check the URL of the active tab against our pattern and...
    //if (urlRegex.test(tab.url)) {
        // ...if it matches, send a message specifying a callback too
        console.log(tab.url);
        pest = tab.url;
        chrome.tabs.sendMessage(tab.id, {text: 'report_back'}, downloadImages);
    //}
  });
