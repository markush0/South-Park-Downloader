const { app, BrowserWindow, ipcMain } = require('electron')
const fs = require('fs');

let mainWindow

function createWindow() {
  mainWindow = new BrowserWindow({ width: 800, height: 600 })

  mainWindow.loadFile('./downloader/index.html')

  mainWindow.webContents.openDevTools()

  mainWindow.on('closed', function () {
    mainWindow = null
  })
}

ipcMain.on('changeWindow', (event, arg) => {
  mainWindow.loadFile(arg)
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

exports.addSeason = function addSeason(targetWindow, season, episodes, german, english) {
  var raw = {
    seasons: []
  }
  var obj = {
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
      var json = JSON.stringify(exsObj)
      fs.writeFile(file, json, 'utf8', function (err) {
        if (err) throw err;
        callback();
      });
    });
  })
}