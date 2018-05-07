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

/**
 * downloadImages(confirmed) will perform the download of the entire thread.
 * @param  {Boolean} confirmed - whether or not to treat this call as pre-
 *   confirmed and bypass the user's confirmation
 */
function downloadImages(confirmed=false) {
  let images = document.getElementsByClassName("icon-download-alt");
	if(confirmed || confirmDownload(images.length)) {
		for(let i=0; i<images.length; i++) {
			// Download image
			images[i].click();
			sleep(1000);
		}
	}
}
