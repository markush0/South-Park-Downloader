const { app, BrowserWindow, ipcMain } = require('electron')
const fs = require('fs');
const { downloadEpisode } = require('./utils/downloader');
const isDev = require('electron-is-dev');
const os = require('os').platform
const path = require('path');

let downloadPath = '';
if(os == 'linux'){
  if (isDev) {
    downloadPath = app.getAppPath() + '/downloads/'
  } else {
    downloadPath = app.getAppPath().replace('/resources/app.asar', '') + '/downloads/'
  }
}else{
  if (isDev) {
    downloadPath = app.getAppPath() + '\\downloads\\'
    console.log(downloadPath);
  } else {
    downloadPath = app.getAppPath().replace('\\resources\\app.asar', '') + '\\downloads\\'
  }
}

let mainWindow

function createWindow() {
  mainWindow = new BrowserWindow({ 
    width: 800, 
    height: 600,
    icon: 'img/256x256.png'
  })

  if(os == 'linux'){
    mainWindow.loadFile('./downloader/index.html')
  }else{
    mainWindow.loadFile('.\\downloader\\index.html')
  }

  

  if (isDev) {
    mainWindow.webContents.openDevTools()
  }

  mainWindow.on('closed', function () {
    mainWindow = null
  })
}

ipcMain.on('changeWindow', (event, arg) => {
  mainWindow.loadFile(arg)
})

ipcMain.on('getSeasons', function (event, arg) {
  return new Promise(resolve => {
    fs.readFile('seasons.json', 'utf8', function (err, data) {
      if (err) throw err;
      let obj = JSON.parse(data).seasons
      let seasons = []
      for (let i = 0; i < obj.length; i++) {
        seasons.push(obj[i].season);
      }
      console.log(seasons);
      resolve(seasons);
    });
  })
})

app.on('ready', createWindow)

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow()
  }
})

exports.getSeasons = function getSeasons(targetWindow) {
  fs.readFile('seasons.json', 'utf8', function (err, data) {
    if (err) throw err;
    let obj = JSON.parse(data).seasons
    let seasons = []
    for (let i = 0; i < obj.length; i++) {
      seasons.push(obj[i].season);
    }
    targetWindow.webContents.send('seasons', seasons)
  });
}

exports.getEpisodes = async function getEpisodes(season, callback) {
  fs.readFile('seasons.json', 'utf8', function (err, data) {
    if (err) throw err;
    let obj = JSON.parse(data).seasons
    let episodes;
    let german;
    let english;
    for (let i = 0; i < obj.length; i++) {
      if (obj[i].season == season) {
        episodes = parseInt(obj[i].episodes)
        german = obj[i].german
        english = obj[i].english
        break;
      }
    }
    callback(episodes, german, english)
  });
}

exports.addSeason = function addSeason(targetWindow, season, episodes, german, english) {
  let raw = {
    seasons: []
  }
  let obj = {
    season: season,
    episodes: episodes,
    german: german,
    english: english
  }
  addObjToJson(obj, 'seasons.json', function () {
    targetWindow.webContents.send('form-received', 'finished');
  })
}

function addObjToJson(obj, file, callback) {
  fs.exists(file, exists => {
    if (!exists) {
      fs.writeFileSync(file, '{"seasons": []}');
    }
    fs.readFile(file, 'utf8', function (err, data) {
      if (err) throw err;
      let exsObj = JSON.parse(data)
      exsObj.seasons.push(obj)
      let json = JSON.stringify(exsObj)
      fs.writeFile(file, json, 'utf8', function (err) {
        if (err) throw err;
        callback();
      });
    });
  })
}

exports.download = function download(selectedEpisodes, german, english, callback) {
  if(selectedEpisodes.seasons[0].episodes.length == 0){
    selectedEpisodes.seasons.splice(0, 1)
  }
  let season = selectedEpisodes.seasons[0].season
  let episode = selectedEpisodes.seasons[0].episodes[0]
  selectedEpisodes.seasons[0].episodes.splice(0, 1)
  downloadEpisode(season, episode, german, english, downloadPath, (dataDownload, errorDownload, dataMerge, errorMerge, episodeName) => {
    if(selectedEpisodes.seasons.length != 0){
      download(selectedEpisodes, german, english, callback)
    }
    callback(dataDownload, errorDownload, dataMerge, errorMerge, episodeName)
  })
  /*for (let i = 0; i < selectedEpisodes.seasons.length; i++) {
    let season = selectedEpisodes.seasons[i].season
    for (let j = 0; j < selectedEpisodes.seasons[i].episodes.length; j++) {
      downloadEpisode(season, selectedEpisodes.seasons[i].episodes[j], german, english, downloadPath, (dataDownload, errorDownload, dataMerge, errorMerge, episodeName) => {
        callback(dataDownload, errorDownload, dataMerge, errorMerge, episodeName)
      })
    }
  }*/
}