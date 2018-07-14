// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const { ipcRenderer, remote } = require('electron');
const { download, getSeasons } = remote.require('./main');
const currentWindow = remote.getCurrentWindow();

let templateScript = $('#season-template').html();

let template = Handlebars.compile(templateScript);

getSeasons(currentWindow)


const submitFormButton = document.querySelector("#download");

/**let episodes = document.querySelectorAll('.episode')
for(let i = 0; i < episodes.length; i++){
    episodes[i].addEventListener('click', function (event) {
        console.log(event.srcElement.innerHTML);
    })
}**/

/*document.querySelector('#database-editor').addEventListener('click', function(event){
    ipcRenderer.send('changeWindow', './editor/index.html');
})

submitFormButton.addEventListener('submit', event => {
    event.preventDefault();
    let season = document.getElementById('season').value;
    let episode = document.getElementById('episode').value;
    let german = document.getElementById('german').checked;
    let english = document.getElementById('english').checked;
    download(currentWindow, season, episode, german, english)
})*/

ipcRenderer.on('form-received', function (event, args) {
    console.log('success!');
});

ipcRenderer.on('seasons', function (event, args) {
    for (a in args) {
        let obj = {
            season: args[a]
        }

        let compiledHtml = template(obj);

        $('.content-placeholder').append(compiledHtml);
    }
    addSeasonOnClick();
});

function addSeasonOnClick() {
    let seasons = document.querySelectorAll('.season')
    for (let i = 0; i < seasons.length; i++) {
        seasons[i].addEventListener('click', function (event) {
            console.log(event.srcElement.innerHTML);
        })
    }
}