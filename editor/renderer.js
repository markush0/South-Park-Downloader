// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const {ipcRenderer} = require('electron');

document.querySelector('#downloader').addEventListener('click', function(event){
    ipcRenderer.send('changeWindow', './downloader/index.html');
})