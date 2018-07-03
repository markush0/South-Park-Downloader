// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const { ipcRenderer, remote } = require('electron');
const { addSeason } = remote.require('./main');
const currentWindow = remote.getCurrentWindow();

const submitFormButton = document.querySelector("#add-season");

document.querySelector('#downloader').addEventListener('click', function (event) {
    ipcRenderer.send('changeWindow', './downloader/index.html');
})

submitFormButton.addEventListener('submit', event => {
    event.preventDefault();
    let season = document.getElementById('season').value;
    let episodes = document.getElementById('episodes').value;
    let german = document.getElementById('german').value == 'on';
    let english = document.getElementById('english').value == 'on';
    addSeason(currentWindow, season, episodes, german, english)
})

ipcRenderer.on('form-received', function (event, args) {
    console.log('success!');
});