# Link component

The File Picker component and Upload Dir Picker component sends a message containing an URL of selected File or Directory using Javascript cross-origin communication feature[^1]. The web page \(e.g.`myfilepicker.html`\) is hosted by \[yourweb\] and the following Javascript code is recommended to be added into it in order to receive a message from the components.

## Shared Script Code

Add the following javascript code into your web page \(`myfilepicker.html`\) which is shared by the components bellow to ensure that the popup window is opened and message is received from west-life portal after user chooses the file.

```javascript
<script>
var popup;
var target;
//opens popup window in defined location, sets the target element id.
function openwindow(_target,href) {
  target = _target;
  popup=window.open(href, 'newwindow', 'width=640, height=480');
}
//receives message from popup window, fills target element with the data received
function receiveMessage(event) {
  document.getElementById(target).innerHTML=event.data;
  document.getElementById(target).setAttribute("href",event.data);
}
window.addEventListener("message", receiveMessage, false);
</script>
```

## File picker

The `filepickercomponent.html` is hosted by west-life portal and returns an URL pointing to the file. HTTP GET of that URL lead to download the file.

Add the following HTML snippet into your web page \(`myfilepicker.html`\). It will open West-life filepicker component in popup window:

```html
<a href="enablejavascript"

   onclick="openwindow('fileid',
   'https://portal.west-life.eu/virtualfolder/filepickercomponent.html'
   ); return false;">West-life File</a>

<p>File:<a id="fileid" href=""></a></p>
```

Note: `'fileid'` links to the element where the URL of chosen file will appear later.

## Upload Dir Picker component

The `uploaddirpickercomponent.html` is hosted by west-life portal and returns an URL pointing to the directory. You can HTTP POST or use WEBDAV access to that directory to upload files.

Add the following HTML snippet into your web page \(`myfilepicker.html`\). It will open West-life  uploaddir picker component in popup window:

```html
<a href="enablejavascript.html" 
   onclick="openwindow('uploaddirid',
   'https://portal.west-life.eu/virtualfolder/uploaddirpickercomponent.html'
   ); return false;"> West-life Upload Dir..</a>

  <p>Directory URL:<a id="uploaddirid" href=""></a></p>
</div>
```

Note: `'uploaddirid'` links to the element where the URL of chosen file will appear later.  
This reuses the same javascript as for filepicker component.

## References
[^1]:Cross-document Messaging: [https://html.spec.whatwg.org/multipage/comms.html\#web-messaging](https://html.spec.whatwg.org/multipage/comms.html#web-messaging)