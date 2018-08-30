// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const { ipcRenderer, remote } = require('electron');
const { getSeasons, getEpisodes, download } = remote.require('./main');
const currentWindow = remote.getCurrentWindow();
const os = require('os').platform;

let selectedEpisodes = {
    seasons: []
}

let currentSeason = -1;
let currentEpisodes = -1;

let seasontemplateScript = $('#season-template').html();

let seasonTemplate = Handlebars.compile(seasontemplateScript);

let episodeTemplateScript = $('#episode-template').html();

let episodeTemplate = Handlebars.compile(episodeTemplateScript);

getSeasons(currentWindow)


const submitFormButton = document.querySelector("#download");

document.querySelector('#database-editor').addEventListener('click', function (event) {
    if(os == 'linux'){
        ipcRenderer.send('changeWindow', './editor/index.html');
    }else{
        ipcRenderer.send('changeWindow', '.\\editor\\index.html');
    }
})

submitFormButton.addEventListener('submit', event => {
    event.preventDefault();
    let german = document.getElementById('german').checked;
    let english = document.getElementById('english').checked;
    download(selectedEpisodes, german, english, (dataDownload, errorDownload, dataMerge, errorMerge, episodeName) => {
        console.log(dataDownload);
        console.log(errorDownload);
        console.log(dataMerge);
        console.log(errorMerge);
        console.log(episodeName);
    })
})

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
            let season = parseInt(event.srcElement.innerHTML.replace('Season ', ''))
            getEpisodes(season, (episodes, german, english) => {
                currentSeason = season
                currentEpisodes = episodes
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
    setSelectAllListener();
    setDeselectAllListener();
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
            if (seasonInList(season)) {
                for (let k = 0; k < selectedEpisodes.seasons.length; k++) {
                    if (selectedEpisodes.seasons[k].season == season) {
                        for (let l = 0; l < selectedEpisodes.seasons[k].episodes.length; l++) {
                            if (selectedEpisodes.seasons[k].episodes[l] == episode) {
                                episodeCheckboxes[j].checked = true;
                            }
                        }
                    }
                }
            }
            episodeCheckboxes[j].addEventListener('click', event => {
                addEpisodeToList(episode, season)
            })
        }
    })
}

function setSelectAllListener() {
    let selectAllButtons = document.querySelectorAll('.select-all')
    for (let i = 0; i < selectAllButtons.length; i++) {
        selectAllButtons[i].addEventListener('click', event => {
            addAllEpisodesToList(currentEpisodes, currentSeason);
            let episodesHolder = document.querySelector('.episode-placeholder')
            for (let i = 0; i < episodesHolder.children.length; i++) {
                episodesHolder.children[i].children[1].checked = true
            }
        })
    }
}

function setDeselectAllListener() {
    let deselectAllButtons = document.querySelectorAll('.deselect-all')
    for (let i = 0; i < deselectAllButtons.length; i++) {
        deselectAllButtons[i].addEventListener('click', event => {
            removeAllEpisodesFromList(currentSeason)
            let episodesHolder = document.querySelector('.episode-placeholder')
            for (let i = 0; i < episodesHolder.children.length; i++) {
                episodesHolder.children[i].children[1].checked = false
            }
        })
    }
}

function seasonInList(season) {
    for (let i = 0; i < selectedEpisodes.seasons.length; i++) {
        if (selectedEpisodes.seasons[i].season == season) {
            return true
        }
    }
    return false
}

function addEpisodeToList(episode, season) {
    episode = parseInt(episode)
    season = parseInt(season)
    if (!seasonInList(season)) {
        let obj = {
            season: season,
            episodes: []
        }
        selectedEpisodes.seasons.push(obj)
    }
    if (episodeInList(season, episode)) {
        for (let k = 0; k < selectedEpisodes.seasons.length; k++) {
            if (selectedEpisodes.seasons[k].season == season) {
                selectedEpisodes.seasons[k].episodes.splice(selectedEpisodes.seasons[k].episodes.indexOf(episode), 1)
            }
        }
    } else {
        for (let k = 0; k < selectedEpisodes.seasons.length; k++) {
            if (selectedEpisodes.seasons[k].season == season) {
                selectedEpisodes.seasons[k].episodes.push(episode)
            }
        }
    }
}

function episodeInList(season, episode) {
    for (let i = 0; i < selectedEpisodes.seasons.length; i++) {
        if (selectedEpisodes.seasons[i].season == season) {
            for (let j = 0; j < selectedEpisodes.seasons[i].episodes.length; j++) {
                if (selectedEpisodes.seasons[i].episodes[j] == episode) {
                    return true;
                }
            }
        }
    }
    return false;
}

function removeAllEpisodesFromList(season) {
    for (let i = 0; i < selectedEpisodes.seasons.length; i++) {
        if (selectedEpisodes.seasons[i].season == season) {
            selectedEpisodes.seasons[i].episodes = []
        }
    }
}

function addAllEpisodesToList(episodes, season) {
    for (let i = 1; i <= episodes; i++) {
        episode = i
        season = parseInt(season)
        if (!seasonInList(season)) {
            let obj = {
                season: season,
                episodes: []
            }
            selectedEpisodes.seasons.push(obj)
        }
        if (!episodeInList(season, episode)) {
            for (let k = 0; k < selectedEpisodes.seasons.length; k++) {
                if (selectedEpisodes.seasons[k].season == season) {
                    selectedEpisodes.seasons[k].episodes.push(episode)
                }
            }
        }
    }
}