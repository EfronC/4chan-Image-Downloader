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

//var urlRegex = /^https?:\/\/((?:[^./?#]+\.)?fireden\.net|desuarchive\.org|archived\.moe|nyafuu\.org)\/\w{1,3}\/thread\/\w*/;
var pest;
var tries = 0;
var toResume = [];

/**
 * downloadImages(confirmed) will perform the download of the entire thread.
 * @param  {Boolean} confirmed - whether or not to treat this call as pre-
 *   confirmed and bypass the user's confirmation
 */
function downloadImages(response) {
	var confirmed=false;
	if (response["name"]) {
		var name = response["name"];
	} else {
		var name = pest.split("/")
  		name = name[name.indexOf("thread") + 1]
	}
	let images = response["images"];
	if(confirmed || confirmDownload(images.length)) {
		for(let i=0; i<images.length; i++) {
			// Download image
			var downloadUrl = images[i].split(" . ")[0];
			img = images[i].split(" . ")[1];
			var downloading = chrome.downloads.download({
				url: downloadUrl,
				filename: name+"/"+img,
				conflictAction: 'uniquify'
			});
			//images[i].click();

		}
	}
}

function resumeDownloads(data) {
	toResume = [];
	for(let j=0; j<data.length;j++) {
		chrome.downloads.resume(data[j]);
	}
}

function handleChanged(delta) {
	if (delta.state && delta.state.current === "complete") {
    	console.log(`Download ${delta.id} has completed.`);
  	}

  	if (delta.error) {
  		console.log(`Download ${delta.id} had an error.`);
  		console.log(delta);
  		toResume.push(delta.id);
  	}

  	chrome.downloads.search({state: "in_progress"}, function(data){
		if (data.length == 0) {
			if (toResume.length > 0 && tries < 5) {
				sleep(5000);
				tries++;
				resumeDownloads(toResume);
			} else {
				if (toResume.length > 0) {
					alert("Some downloads could not be completed");
				} else {
					console.log("Downloads ended");
				}
			}
		}
	});
}

chrome.downloads.onChanged.addListener(handleChanged)

chrome.browserAction.onClicked.addListener(function(tab) { 
	// ...check the URL of the active tab against our pattern and...
    //if (urlRegex.test(tab.url)) {
        // ...if it matches, send a message specifying a callback too
        console.log(tab.url);
        pest = tab.url;
        chrome.tabs.sendMessage(tab.id, {text: 'report_back'}, downloadImages);
    //}
});
