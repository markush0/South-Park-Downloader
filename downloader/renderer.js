// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const { ipcRenderer, remote } = require('electron');
const { download, getSeasons, getEpisodes } = remote.require('./main');
const currentWindow = remote.getCurrentWindow();

let selectedEpisodes = {
    seasons: []
}

let seasontemplateScript = $('#season-template').html();

let seasonTemplate = Handlebars.compile(seasontemplateScript);

let episodeTemplateScript = $('#episode-template').html();

let episodeTemplate = Handlebars.compile(episodeTemplateScript);

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

        let compiledHtml = seasonTemplate(obj);

        $('.season-placeholder').append(compiledHtml);
    }
    addSeasonOnClick();
});

function addSeasonOnClick() {
    let seasons = document.querySelectorAll('.season')
    for (let i = 0; i < seasons.length; i++) {
        seasons[i].addEventListener('click', function (event) {
            let season = event.srcElement.innerHTML.replace('Season ', '')
            getEpisodes(season, (episodes, german, english) => {
                $('.episode-placeholder').html("")
                for (let i = 1; i <= episodes; i++) {
                    let obj = {
                        episode: i
                    }

                    let compiledHtml = episodeTemplate(obj);

                    $('.episode-placeholder').append(compiledHtml);

                    let season = event.srcElement.innerHTML.replace('Season ', '')
                    setEpisodeOnClick(season)
                }
            })
        })
    }
}

function setEpisodeOnClick(season) {
    getEpisodes(season, (episodes, german, english) => {
        $('.episode-placeholder').html("")
        for (let i = 1; i <= episodes; i++) {
            let obj = {
                episode: i
            }

            let compiledHtml = episodeTemplate(obj);



            $('.episode-placeholder').append(compiledHtml);
        }

        let episodeCheckboxes = document.querySelectorAll('.download-checkbox')
        for (let j = 0; j < episodeCheckboxes.length; j++) {
            let episode = episodeCheckboxes[j].previousSibling.previousSibling.innerHTML.replace('Episode ', '')
            if(seasonInList(season)){
                for (let k = 0; k < selectedEpisodes.seasons.length; k++) {
                    if(selectedEpisodes.seasons[k].season == season){
                        for (let l = 0; l < selectedEpisodes.seasons[k].episodes.length; l++) {
                            if(selectedEpisodes.seasons[k].episodes[l] == episode){
                                episodeCheckboxes[j].checked = true;
                            }
                        }
                    }
                }
            }
            episodeCheckboxes[j].addEventListener('click', event => {
                if (!seasonInList(season)) {
                    let obj = {
                        season: season,
                        episodes: []
                    }
                    selectedEpisodes.seasons.push(obj)
                }
                for (let k = 0; k < selectedEpisodes.seasons.length; k++) {
                    if (selectedEpisodes.seasons[k].season == season) {
                        selectedEpisodes.seasons[k].episodes.push(episode)
                    }
                }
            })
        }
    })
}

function seasonInList(season) {
    for (let i = 0; i < selectedEpisodes.seasons.length; i++) {
        if (selectedEpisodes.seasons[i].season == season) {
            return true
        }
    }
    return false
}