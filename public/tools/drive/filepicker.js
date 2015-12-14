
var developerKey = 'AIzaSyCvXXMvwEMJktzICtLSrXiu_RfoyKhovG4';
var CLIENT_ID = '786228898617.apps.googleusercontent.com';
var SCOPES = [
//  'https://www.googleapis.com/auth/photos',
  'https://www.googleapis.com/auth/drive'];
var pickerApiLoaded = false;
var USER_ID = "";
var oauthToken;
var currentIsBackgroundEditorMode = false;
var host = 'http://media.hit.camp';

// Use the API Loader script to load google.picker and gapi.auth.
function onApiLoad() {

  USER_ID = parent.$("#data-email").html();
//  console.log(USER_ID);
//  checkAuth();
  gapi.load('auth', {'callback': onAuthApiLoad});
  gapi.load('picker', {'callback': onPickerApiLoad});
  gapi.client.setApiKey(developerKey);
  gapi.client.load('drive', 'v2', this._driveApiLoaded.bind(this));
}


/**
 * Called when the Google Drive file picker API has finished loading.
 * @private
 */
function _pickerApiLoaded() {
  this.buttonEl.disabled = false;
}
/**
 * Called when the Google Drive API has finished loading.
 * @private
 */
function _driveApiLoaded() {
  _doAuth(true);

  setTimeout(function() {
    parent.document.filepickerLoaded = true;
    parent.$(".js-edit-background").removeAttr("disabled");
  }, 500);
}
/**
 * Authenticate with Google Drive via the Google JavaScript API.
 * @private
 */
function _doAuth(immediate, callback) {
  gapi.auth.authorize({
    client_id: CLIENT_ID,
    scope: ['https://www.googleapis.com/auth/drive',
//      'https://www.googleapis.com/auth/photos'
      ],
    immediate: immediate,
    user_id: USER_ID,
    authuser: -1
  }, callback);
}

function onAuthApiLoad() {
  window.gapi.auth.authorize({
    client_id: CLIENT_ID,
    scope: SCOPES,
    immediate: true,
    user_id: USER_ID,
    authuser: -1
  },
  handleAuthResult);
}

function onPickerApiLoad() {
  pickerApiLoaded = true;
  //createPicker();
}

function handleAuthResult(authResult) {

  var authButton = document.getElementById('authorizeButton');
  authButton.style.display = 'none';
  if (authResult && !authResult.error) {
    oauthToken = authResult.access_token;
    getSmoothboardFolder();

    if (hideAfterAuthorization) {
      hideAfterAuthorization = false;
      parent.hideFilePicker();
    }
    //    createPicker();
  } else {

// No access token could be retrieved, show the button to start the authorization flow.
    authButton.style.display = 'block';
    authButton.onclick = function(event) {

      event.preventDefault();
      gapi.auth.authorize(
          {
            client_id: CLIENT_ID,
            scope: SCOPES,
            immediate: false,
            user_id: USER_ID,
            authuser: -1
          },
      handleAuthResult);
    };
  }
}

var hideAfterAuthorization = false;

var currentIsAllType = true;
function checkPicker() {
  if (currentIsBackgroundEditorMode !== parent.backgroundEditorMode) {
    createPicker();
  }
}
// Create and render a Picker object for picking user Photos.
function createPicker() {
//  createPickerAllTypes();
  if (parent.backgroundEditorMode) {
    currentIsBackgroundEditorMode = true;
    createPickerImage();
  } else {
    currentIsBackgroundEditorMode = false;
    createPickerAllTypes();
  }
}

function createPickerAllTypes() {
  if (pickerApiLoaded && oauthToken && rootFolderSmoothboard) {
    var uploadView = new google.picker.DocsUploadView();
    uploadView.setIncludeFolders(true)
    uploadView.setParent(rootFolderSmoothboard);

    var docsView = new google.picker.View(google.picker.ViewId.DOCUMENTS);
//    docsView.setMimeTypes("application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword");

    var presentationsView = new google.picker.View(google.picker.ViewId.PRESENTATIONS);
//    presentationsView.setMimeTypes("application/vnd.openxmlformats-officedocument.presentationml.presentation,application/vnd.ms-powerpoint");
//          uploadView.setIncludeFolders(true);

    var picker = new google.picker.PickerBuilder().
        addView(uploadView).
//              addView(google.picker.ViewId.PHOTOS).
        addView(google.picker.ViewId.IMAGE_SEARCH).
        addView(google.picker.ViewId.VIDEO_SEARCH).
//              addView(google.picker.ViewId.DOCUMENTS).
        addViewGroup(
            new google.picker.ViewGroup(google.picker.ViewId.DOCS).
            addView(google.picker.ViewId.DOCS_IMAGES).
//            addView(google.picker.ViewId.PHOTOS).
            addView(google.picker.ViewId.PDFS).
            addView(docsView).
            addView(presentationsView)).
//            addView(google.picker.ViewId.RECENTLY_PICKED)).
//        addViewGroup(
//            new google.picker.WebCamView(google.picker.WebCamViewType.STANDARD)).
        setTitle("Hit.Camp Media Picker").
        setOAuthToken(oauthToken).
        setDeveloperKey(developerKey).
        setCallback(pickerCallback).
        setOrigin(window.location.protocol + '//' + window.location.host).
        enableFeature(google.picker.Feature.MULTISELECT_ENABLED).//bug for upload
        build();
    picker.setVisible(true);
  }
}
function createPickerImage() {
  if (pickerApiLoaded && oauthToken && rootFolderSmoothboard) {
    var uploadView = new google.picker.DocsUploadView();
    uploadView.setIncludeFolders(true)
    uploadView.setParent(rootFolderSmoothboard);
    uploadView.setMimeTypes('image/png,image/jpeg,image/gif');

    var imageSearchView = new google.picker.ImageSearchView();
    imageSearchView.setLicense(google.picker.ImageSearchView.License.REUSE);
//          uploadView.setIncludeFolders(true);

    var picker = new google.picker.PickerBuilder().
        addView(uploadView).
//              addView(google.picker.ViewId.PHOTOS).
        addView(imageSearchView).
//              addView(google.picker.ViewId.DOCUMENTS).
//        addViewGroup(
//            new google.picker.ViewGroup(google.picker.ViewId.DOCS).
//        addView(google.picker.ViewId.DOCS_IMAGES).
//            addView(google.picker.ViewId.PHOTOS).
//            addView(google.picker.ViewId.DOCUMENTS).
//            addView(google.picker.ViewId.PRESENTATIONS)).
//            addView(google.picker.ViewId.RECENTLY_PICKED)).
//        addViewGroup(
//            new google.picker.WebCamView(google.picker.WebCamViewType.STANDARD)).
        setTitle("Hit.Camp Media Picker").
        setOAuthToken(oauthToken).
        setDeveloperKey(developerKey).
        setCallback(pickerCallbackImage).
        setOrigin(window.location.protocol + '//' + window.location.host).
        enableFeature(google.picker.Feature.MULTISELECT_ENABLED).//bug for upload
        build();
    picker.setVisible(true);
  } else {

  }
}

function pickerCallbackImage(data) {
  var url;

  $("#imgSpinner").css('visibility', 'visible');
  if (data[google.picker.Response.ACTION] == google.picker.Action.CANCEL) {
//    $("#imgSpinner").hide();
    hideFilePicker();
  } else if (data[google.picker.Response.ACTION] == google.picker.Action.PICKED) {

    $("#progressDescription").html("Processing Media...");

    var files = data[google.picker.Response.DOCUMENTS];
    var file = files[0];
    url = file[google.picker.Document.URL];
    var fileID = file[google.picker.Document.ID];
    var fileTitle = (file.name) ? file.name : file.title;
    var isNew = file.isNew;
    if (isNew) {
      console.log("Multi %O", files);
      fileUploadedProcessMulti(files);
    } else {

//existing file from web
      var imageDataArray = [];
      _.each(files, function(file) {
        if (file.serviceId === 'search-api') {
          if (file.mimeType === "image/jpeg" || file.mimeType === "image/png" || file.mimeType === "image/gif") {
            var imageURL = processSearchedImageData(file.thumbnails[1].url);
            console.log(processSearchedImageData(file.thumbnails[1].url));
            console.log(imageURL);
            imageDataArray.push({resourceURL: host + '/image/' + encodeURIComponent(imageURL)});
//        });
          }
        }
      });

      parent.pickedImages(imageDataArray);
      hideFilePicker();
    }
  }
}
// A simple callback implementation.
function pickerCallback(data) {

  console.log(data);
  var url;

  $("#imgSpinner").css('visibility', 'visible');
  if (data[google.picker.Response.ACTION] == google.picker.Action.CANCEL) {
//    $("#imgSpinner").hide();
    hideFilePicker();
  } else if (data[google.picker.Response.ACTION] == google.picker.Action.PICKED) {

    $("#progressDescription").html("Processing Media...");

    var files = data[google.picker.Response.DOCUMENTS];
    var file = files[0];
    url = file[google.picker.Document.URL];
    var fileID = file[google.picker.Document.ID];
    var fileTitle = (file.name) ? file.name : file.title;
    var isNew = file.isNew;
    if (isNew) {
      if (_.size(files) > 1) {
        console.log("Multi %O", files);
        fileUploadedProcessMulti(files);
      } else {
        console.log(fileID);
        fileUploadedProcess(fileID, fileTitle);
      }
    } else {
//existing file from web
      if (file.serviceId === 'search-api') {
//files from the web
        if (file.mimeType === "application/x-shockwave-flash") {
// youtube        
          var param = getUrlVars(file.url);
          var youtubeURL = '//www.youtube.com/embed/' + param.v + '?rel=0';
          sendCallback({
            resourceURL: youtubeURL,
            thumbnailLink: file.thumbnails[1].url,
            title: fileTitle,
            isImage: false
          });
        } else if (file.mimeType === "image/jpeg" || file.mimeType === "image/png" || file.mimeType === "image/gif") {
// images        
          var imageURL = processSearchedImageData(file.thumbnails[1].url);
          console.log(processSearchedImageData(file.thumbnails[1].url));
          console.log(imageURL);
          sendCallback({
            resourceURL: host + '/image/' + encodeURIComponent(imageURL), //file.thumbnails[1].url, 
            thumbnailLink: file.thumbnails[0].url,
            title: fileTitle,
            isImage: true
          });
        }
      } else if (file.serviceId === 'docs' //
//          || file.serviceId === 'doc' //document
          || file.serviceId === 'DoclistBlob' //pdf / ppt
//          || file.serviceId === 'pres' // google slides
          ) {
//files from google drive
        copyFileToFolder(fileID, fileTitle, rootFolderSmoothboard, function(resp) {
          fileUploadedProcess(resp.id, fileTitle);
        });
      } else if (
          file.serviceId === 'pres' // google slides
          || file.serviceId === 'doc'  //google docs
          ) {
        console.log(fileID);
        copyFileToFolder(fileID, fileTitle, rootFolderSmoothboard, function(resp) {
//          debugger;
          var exportPDFLink = resp.exportLinks['application/pdf'];
          if (!exportPDFLink) {
            showErrorAndClose();
          }
          exportFileToFolder(resp.id, resp.id, exportPDFLink, rootFolderSmoothboard, function(resp) {
            fileUploadedProcess(resp.id, fileTitle);
          });
        });
      } else {
        console.log("File not supported");

        $("#progressDescription").html("File not supported. <br><br><br>If you would like your file to be supported on Hit.Camp, please do post it at the community forum");

        setTimeout(function() {
          hideFilePicker();
        }, 3000);
      }
    }
  }
}

function fileUploadedProcess(fileId, fileTitle) {
// -set share -get URL n thumbnail -upload thumbnail -share image -get URL
//  setFilePermissionShare(fileId, function(file) {
  getFileProperties(fileId, function(file) {
    console.log(file);
    var fileURL = '';
    var isImage = false;
    if (file.mimeType == 'image/jpeg' || file.mimeType == 'image/png' || file.mimeType == 'image/gif') {
      isImage = true;
      fileURL = file.webContentLink.replace('&export=download', '');
      fileURL = host + '/image/' + encodeURIComponent(fileURL);
    } else if (!file.embedLink || file.embedLink) {
      fileURL = file.alternateLink + '&rm=minimal';

      retrieveImagesAsync(fileId);
      return;
    } else {
//      fileURL = file.alternateLink + '&rm=minimal';
      fileURL = file.embedLink;
    }

    var thumbnailLink = file.thumbnailLink;
    console.log(thumbnailLink);
    //    thumbnailLink = false;
    if (thumbnailLink) {
      uploadThumbnailProcess(thumbnailLink, function(thumbnailFile) {
        var thumbnailFileShared = thumbnailFile.webContentLink.replace('&export=download', '');

        sendCallback({
          resourceURL: fileURL,
          thumbnailLink: host + '/image/' + encodeURIComponent(thumbnailFileShared),
          title: fileTitle,
          isImage: isImage
        });
      });
    } else {
//if doc type assume no thumbnail
      console.log("no thumbnail found");
      //reupload terus call
      //thumbnail from first page;
      thumbnailLink = file.alternateLink.replace('/edit?usp=drivesdk', '') + '/image?pagenumber=1&w=300&pli=1';
      thumbnailLink = host + '/image/' + encodeURIComponent(thumbnailLink);

      sendCallback({
        resourceURL: fileURL,
        thumbnailLink: thumbnailLink,
        title: fileTitle,
        isImage: false
      });
    }

  });
}

function uploadThumbnailProcess(thumbnailLink, callback) {
  thumbnailLink = host + '/image/' + encodeURIComponent(thumbnailLink);
  console.log(thumbnailLink);
  convertImgToBase64(thumbnailLink, function(base64Data) {
    var fileTitle = 'thumbnail';
    var mimeType = "image/png";

    console.log(fileTitle);
    var metadata = {
      'title': fileTitle,
      'mimeType': mimeType,
      'parents': [{"id": rootFolderSmoothboard}],
    };
    var pattern = 'data:' + mimeType + ';base64,';
    base64Data = base64Data.replace(pattern, '');
    insertThumbnail(base64Data, metadata, callback);
  });
}

function insertThumbnail(base64Data, metadata, callback) {
  var boundary = '-------314159265358979323846';
  var delimiter = "\r\n--" + boundary + "\r\n";
  var close_delim = "\r\n--" + boundary + "--";
  var contentType = metadata.mimeType || 'application/octet-stream';
  var multipartRequestBody =
      delimiter + 'Content-Type: application/json\r\n\r\n' +
      JSON.stringify(metadata) + delimiter +
      'Content-Type: ' + contentType + '\r\n' +
      'Content-Transfer-Encoding: base64\r\n' +
      '\r\n' + base64Data + close_delim;
//  console.log("Uploading Thumbnail: %O",  metadata);

  var request = gapi.client.request({
    'path': '/upload/drive/v2/files',
    'method': 'POST',
    'params': {'uploadType': 'multipart'},
    'headers': {'Content-Type': 'multipart/mixed; boundary="' + boundary + '"'},
    'body': multipartRequestBody
  });
//  }
  request.execute(function(resp) {
    getFileProperties(resp.id, function(file) {
      console.log("Set Shared: " + file.id);
      callback.call(this, file);
    });
  });
}

function uploadBackground(base64Data, callback) {
  var fileTitle = 'adventure_map';
  var mimeType = "image/png";

  console.log(fileTitle);
  var metadata = {
    'title': fileTitle,
    'mimeType': mimeType,
    'parents': [{"id": rootFolderSmoothboard}],
  };

  var pattern = 'data:' + mimeType + ';base64,';
  base64Data = base64Data.replace(pattern, '');
  insertThumbnail(base64Data, metadata, function(file) {

    var fileURL = file.webContentLink.replace('&export=download', '');
    var fileURL = host + '/image/' + encodeURIComponent(fileURL);
    callback.call(this, fileURL);
  });
}


function exportFileToFolder(fileID, fileTitle, exportPDFLink, folderID, callback) {
//  var exportString = 'export?format=pdf';
  var requestUrl = exportPDFLink;//embedUrl.replace('preview', exportString);
//  var requestUrl = 'export/pptx?';
  console.log(requestUrl);
  var xhr = new XMLHttpRequest();
  xhr.open("GET", requestUrl);
  xhr.responseType = "arraybuffer";

//  var fileTitle = 'Presentation';
//  var mimeType = "application/vnd.openxmlformats-officedocument.presentationml.presentation";
//
//  console.log(fileTitle);
//  var metadata = {
//    'title': fileTitle,
//    'mimeType': mimeType,
//    'parents': [{"id": rootFolderSmoothboard}],
//  };
//  var binary = getBinary(requestUrl);
//  var base64Data = base64encode(binary);
//
////  base64Data = base64Data.replace(pattern, '');
//  insertFileData(base64Data, metadata, callback);

  xhr.onload = function() {
    if (this.status === 200) {
      var uInt8Array = new Uint8Array(this.response);
      var i = uInt8Array.length;
      var binaryString = new Array(i);
      while (i--)
      {
        binaryString[i] = String.fromCharCode(uInt8Array[i]);
      }
      var data = binaryString.join('');

      var base64Data = window.btoa(data);
//  convertImgToBase64(thumbnailLink, function(base64Data) {
      var fileTitle = 'Lesson Data - Slides';
      var mimeType = 'application/pdf';//"application/vnd.openxmlformats-officedocument.presentationml.presentation";

      console.log(fileTitle);
      var metadata = {
        'title': fileTitle,
        'mimeType': mimeType,
        'parents': [{"id": rootFolderSmoothboard}],
      };
//      var pattern = 'data:' + mimeType + ';base64,';
//      base64Data = base64Data.replace(pattern, '');
      insertFileData(base64Data, metadata, callback);

      deleteFile(fileID);
    } else {
      showErrorAndClose();
      return;
    }
  };

  xhr.send();
}

function getBinary(file) {
  var xhr = new XMLHttpRequest();
  xhr.open("GET", file, false);
  xhr.overrideMimeType("text/plain; charset=x-user-defined");
  xhr.send(null);
  return xhr.responseText;
}

function base64encode(binary) {
  return btoa(unescape(encodeURIComponent(binary)));
}

function deleteFile(fileId) {
  var request = gapi.client.drive.files.delete({
    'fileId': fileId
  });
  request.execute(function(resp) {
//    debugger;
  });
}

function insertFileData(base64Data, metadata, callback) {
  var boundary = '-------314159265358979323846';
  var delimiter = "\r\n--" + boundary + "\r\n";
  var close_delim = "\r\n--" + boundary + "--";
  var contentType = metadata.mimeType || 'application/octet-stream';
  var multipartRequestBody =
      delimiter + 'Content-Type: application/json\r\n\r\n' +
      JSON.stringify(metadata) + delimiter +
      'Content-Type: ' + contentType + '\r\n' +
      'Content-Transfer-Encoding: base64\r\n' +
      '\r\n' + base64Data + close_delim;
//  console.log("Uploading Thumbnail: %O",  metadata);

  var request = gapi.client.request({
    'path': '/upload/drive/v2/files',
    'method': 'POST',
    'params': {'uploadType': 'multipart'},
    'headers': {'Content-Type': 'multipart/mixed; boundary="' + boundary + '"'},
    'body': multipartRequestBody
  });
//  }
  request.execute(function(resp) {
    getFileProperties(resp.id, function(file) {
      console.log("Set Shared: " + file.id);
      callback.call(this, file);
    });
  });
}

var rootFolderSmoothboard;
function getRootFolder() {
  var request = gapi.client.drive.about.get();
  request.execute(function(resp) {
//    console.log('Current user name: ' + resp.name);
    console.log('Root folder ID: ' + resp.rootFolderId);
//    rootFolder = resp.rootFolderId;
    getSmoothboardFolder(); //"Hit.Camp Data4", null, null);
  });
}

function getSmoothboardFolder() {//folderName, rootFolderId, evt) {
  var smoothboardFolder = "Hit.Camp Data";
  var request = gapi.client.request({
    'path': 'drive/v2/files',
    'method': 'GET',
    'params': {
      'maxResults': '20',
      'q': "trashed = false and mimeType = 'application/vnd.google-apps.folder' and title contains '"
          + smoothboardFolder + "'"
    }
  });
  request.execute(function(fileList) {
    if (fileList.items[0])
    {
      folderId = fileList.items[0].id;
      parentId = fileList.items[0].parents[0].id;
//      console.log("Smoothboard folder exists: " + folderId);
      rootFolderSmoothboard = folderId;
      if (fileList.items[0].shared) { //check folder shared
        createPicker();
      } else {
        setFilePermissionShare(rootFolderSmoothboard, function() {
//          console.log("Set Shared Folder: " + rootFolderSmoothboard);
          createPicker();
        });
      }
//      uploadFile(folderId, evt);
    } else {
//      console.log("Smoothboard folder does not exist");
      createFolder(smoothboardFolder, function() {
        createPicker();
      });
    }
  });
}

function createFolder(folderName, callback) {
  data = new Object();
  data.title = folderName;
//  data.parents = [{"id": rootFolderId}];
  data.mimeType = "application/vnd.google-apps.folder";
  gapi.client.drive.files.insert({'resource': data}).execute(
      function(fileList) {
        rootFolderSmoothboard = fileList.id;
        setFilePermissionShare(rootFolderSmoothboard, function() {
          console.log("Created Folder: " + rootFolderSmoothboard);
          callback.call(this);
        });
      });
}

function setFilePermissionShare(fileId, callback) {

  var body = {
    'value': '',
    'type': 'anyone',
    'role': 'reader',
    'withLink': true
  };
  var request = gapi.client.drive.permissions.insert({
    'fileId': fileId,
    'resource': body
  });
  request.execute(function(resp) {
    console.log("Set Permission: " + resp);
    callback.call(this, resp);
//    getFileProperties(fileId, function(resp) {
//      console.log("Get Properties: " + resp);
//      callback.call(this, resp);
//    });
  });
}

function getFileProperties(fileId, callback) {
  var request = gapi.client.drive.files.get({
    'fileId': fileId
  });
  request.execute(function(resp) {
    callback.call(this, resp);
  });
}

function copyFileToFolder(fileID, fileTitle, folderID, callback) {
  var body = {
    'title': fileTitle,
    'parents': [{"id": folderID}]
  };
  var request = gapi.client.drive.files.copy({
    'fileId': fileID,
    'resource': body
  });
  request.execute(function(resp) {
//    console.log('Copy ID: ' + resp.id);
    callback.call(this, resp);
  });
}

function convertImgToBase64(url, callback, outputFormat) {
  var img = document.createElement('IMG');

  img.crossOrigin = 'Anonymous';
  img.onload = function() {
    var canvas = document.createElement('CANVAS');
    var ctx = canvas.getContext('2d');
    canvas.height = img.height;
    canvas.width = img.width;
    ctx.drawImage(img, 0, 0);
    var dataURL = canvas.toDataURL(outputFormat || 'image/png');
    callback.call(this, dataURL);
// Clean up
    canvas = null;
  };
  img.src = url;
}

function sendCallback(fileData) {
  fileData.type = 'ResourceUpdate';
  fileData = JSON.stringify(fileData);
  parent.$(parent.window).trigger('LocalMessageResourceUpdate', [{detail: fileData}]);

  hideFilePicker();
}

function sendCallBackImageUpdate(imageURL, thumbnailURL) {
  sendCallback({
    resourceURL: host + '/image/' + encodeURIComponent(imageURL), //file.thumbnails[1].url, 
    thumbnailLink: host + '/image/' + encodeURIComponent(thumbnailURL),
    title: "",
    isImage: true
  });
}

function getUrlVars(url) {
  var vars = {};
  var frameURL = decodeURIComponent(url);
  if (frameURL.indexOf('?') < 0) {
    return vars;
  }
  var parts = frameURL.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m, key, value) {
    vars[key] = value;
  });
  return vars;
}

function checkURL(url, index, callback) {
  var fullURL = url + ++index;
  var proxiedURL = host + '/image/' + encodeURIComponent(fullURL);

  parent.$.ajax({
    type: 'HEAD',
    url: proxiedURL,
    success: function(msg) {
      checkURL(url, index, callback);
      if (index > 1)
        $("#progressDescription").html("Processing Slides: Slide " + (index - 1));
    },
    error: function(jqXHR, textStatus, errorThrown) {
      callback(index);
    },
    async: true
  });

}

function retrieveImagesAsync(fileId) {
  console.log(fileId);
  var urlStart = 'https://docs.google.com/file/d/';
  var urlEndCheck = '/image?w=1&pli=1&pagenumber=';
  var urlEnd = '/image?w=1000&pli=1&pagenumber=';
  var urlEndThumbnail = '/image?w=300&pli=1&pagenumber=';
  var isEnd = false;
  var biggestSuccess = 0;
  var i = 0;

  var url = urlStart + fileId + urlEndCheck;
  $("#progressDescription").html("Processing Slides...");
  checkURL(url, 0, function(index) {
    var numberOfPages = index - 2;

    $("#progressDescription").html("Processing Slides: Completed");

    console.log("Number of pages: " + numberOfPages);
    var imageDataArray = [];
    for (var i = 1; i <= numberOfPages; i++) {
      var imageURL = host + '/image/' + encodeURIComponent(urlStart + fileId + urlEnd + i);
      var thumbnailURL = host + '/image/' + encodeURIComponent(urlStart + fileId + urlEndThumbnail + i);
      var imageData = {
        resourceURL: imageURL,
        thumbnail: thumbnailURL,
        resourceTitle: ""
      };

      imageDataArray.push(imageData);
      parent.imgPreloader.push(imageURL);
    }

    var imageDataFirst = {
      resourceURL: imageDataArray[0].resourceURL,
      thumbnailLink: imageDataArray[0].thumbnail,
      title: "",
      isImage: true
    };

    if (imageDataArray.length > 0) {
      parent.document.imageDataArray = imageDataArray;
      parent.$(".js-new-images").click();
      hideFilePicker();
    }

  });
}

function fileUploadedProcessMultiImage(files) {
  var processes = [];

  _.each(files, function(file) {
    processes.push(function(callback) {
      processFile(file, callback);
    });
  });

//  console.log("Start");
  async.parallel(
      processes,
      function(err, imageDataArray) {
        var imageDataFirst = {
          resourceURL: imageDataArray[0].resourceURL,
          thumbnailLink: imageDataArray[0].thumbnail,
          title: "",
          isImage: true
        };

        if (imageDataArray.length > 0) {
          console.log(imageDataArray);
          parent.document.imageDataArray = imageDataArray;//results;
          parent.$(".js-new-images").click();
          hideFilePicker();
        }
      });
}

function fileUploadedProcessMulti(files) {
  var processes = [];

  _.each(files, function(file) {
    processes.push(function(callback) {
      processFile(file, callback);
    });
  });

//  console.log("Start");
  async.parallel(
      processes,
      function(err, imageDataArray) {
//        console.log(imageDataArray);
//        parent.document.imageDataArray = imageDataArray;//results;
        parent.pickedImages(imageDataArray);
        //        parent.$(".js-new-images").click();
        hideFilePicker();
      });
}


function processFile(file, callback) {
  var fileId = file[google.picker.Document.ID];
  var fileURL = '';
  var isImage = false;

  getFileProperties(fileId, function(file) {

    if (file.mimeType == 'image/jpeg' || file.mimeType == 'image/png' || file.mimeType == 'image/gif') {
      isImage = true;
      fileURL = file.webContentLink.replace('&export=download', '');
      fileURL = host + '/image/' + encodeURIComponent(fileURL);
    }

    var thumbnailLink = file.thumbnailLink;
    if (thumbnailLink) {
      uploadThumbnailProcess(thumbnailLink, function(thumbnailFile) {
        var thumbnailFileShared = thumbnailFile.webContentLink.replace('&export=download', '');

        var imageData = {
          resourceURL: fileURL,
          thumbnail: host + '/image/' + encodeURIComponent(thumbnailFileShared),
          resourceTitle: ""
        };

        parent.imgPreloader.push(fileURL);
        callback(null, imageData);
      });
    }
  });
}

function processSearchedImageData(url) {
  var originalUrl = url;
  var urlProcess = url;
  if (urlProcess.indexOf("upload.wikimedia.org") > -1) {
    var filename = urlProcess.substring(url.lastIndexOf('/') + 1);
    urlProcess = urlProcess.replace('/commons/', '/commons/thumb/');
    urlProcess += '/640px-' + filename;
    parent.$.ajax({
      type: 'HEAD',
      url: urlProcess,
      success: function(msg) {
//        urlProcess
      },
      error: function(jqXHR, textStatus, errorThrown) {
        urlProcess = originalUrl;
      },
      async: false
    });

    return urlProcess;
  } else {
    return originalUrl;
  }
}

function hideFilePicker() {
//  createPicker();
  onAuthApiLoad();
  parent.hideFilePicker();

  $("#imgSpinner").css('visibility', 'hidden');
  $("#progressDescription").html("");
}

function  showErrorAndClose() {
  $("#progressDescription").html("Error processing file. <br><br><br>If error persist, please do report the bug at community.hit.camp");

  setTimeout(function() {
    hideFilePicker();
  }, 3000);
}

