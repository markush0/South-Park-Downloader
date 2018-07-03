// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const {ipcRenderer} = require('electron');

let seasons = document.querySelectorAll('.season')
for(let i = 0; i < seasons.length; i++){
    seasons[i].addEventListener('click', function (event) {
        console.log(event.srcElement.innerHTML);
    })
}

let episodes = document.querySelectorAll('.episode')
for(let i = 0; i < episodes.length; i++){
    episodes[i].addEventListener('click', function (event) {
        console.log(event.srcElement.innerHTML);
    })
}

document.querySelector('#database-editor').addEventListener('click', function(event){
    ipcRenderer.send('changeWindow', './editor/index.html');
})