const {
    spawn
} = require('child_process');
const fs = require('fs');
const os = require('os').platform;
const findRemove = require('find-remove')

const germanLink = 'https://www.southpark.de/alle-episoden/s'
const englishLink = 'https://southpark.cc.com/full-episodes/s'

module.exports.downloadEpisode = async function downloadEpisode(season, episode, german, english, path, callback, progressCallback, chunksCallback, currentChunkCallback, mergingCallback) {
    if (episode < 10) {
        episode = '0' + episode
    }
    if (season < 10) {
        season = '0' + season
    }

    if (german && english) {

    } else {
        let episodeLink;
        if (english) {
            episodeLink = englishLink + season + 'e' + episode
        } else {
            episodeLink = germanLink + season + 'e' + episode
        }

        let [resolutionWidth, errorResolution] = await getBestResolutionWidth(episodeLink, path)

        let [dataDownload, errorDownload, filenames, episodeName, code] = await download(episodeLink, path, "temp%(title)s.%(ext)s", season, episode, resolutionWidth, progressCallback, chunksCallback, currentChunkCallback)

        if (code == 0 || code == 1) {
            mergingCallback();
            let [dataMerge, errorMerge] = await merge(filenames, path, episodeName, season, episode)

            deleteFiles(path)

            callback(dataDownload, errorDownload, dataMerge, errorMerge, episodeName)
        }
    }
}

// the single parts are available with different resolutions. Not always the best resolution is marked as 'best'. It appears that youtube-dl takes not the best or even differnet resolutions for the part files.
// This function detects the best available resolution width which can be passed to the download function.
async function getBestResolutionWidth(link, path) {
    return new Promise((resolve, reject) => {
        let command;
        if(os == 'linux'){
            command = spawn(`youtube-dl`, [link, '-F'])
        }else{
            command = spawn(path.replace('\\downloads\\', '\\') + `youtube-dl.exe`, [link, '-F'])
        }

        let data = '';
        command.stdout.setEncoding('utf8');
        command.stdout.on('data', (chunk) => {
            data += chunk;
        })

        let error = ''
        command.stderr.on('data', (chunk) => {
            error += chunk
            console.log(error);
        })

        command.on('error', err => {
            console.log(err);
            reject()
        })

        command.on('close', (code) => {
            var lines = data.split('\n');
            var myRegexp = /(\d{3,4})x\d{3,4}/;

            var allResolutions = [];

            for(var i = 0;i < lines.length;i++){
               var line = lines[i].match(myRegexp);

               if(line != null)
               {
                  allResolutions.push(line[1]);
               }
            }

            allResolutions = allResolutions.slice().sort();

            var resolutionTriplets = [];
            for (var i = 0; i < allResolutions.length - 2; i++) {
                if (allResolutions[i + 1] == allResolutions[i] && allResolutions[i + 2] == allResolutions[i]) {
                    resolutionTriplets.push(allResolutions[i]);
                }
            }

            if(resolutionTriplets.length == 0)
            {
                console.log('No equal resolutions for the 3 subparts could be found.' + data);
                reject()
            }

            var resolutionWidth = Math.min.apply(Math, resolutionTriplets.map(Number));

            resolve([resolutionWidth, error])
        })
    })
}

async function download(link, path, output, season, episode, resolutionWidth, progressCallback, chunksCallback, currentChunkCallback) {
    return new Promise((resolve, reject) => {
        let command;
        var args = [link, '--newline', '--write-info-json', '-o', path + output, '-f [width=' + resolutionWidth + ']'];

        if (os == 'linux') {
            command = spawn(`youtube-dl`, args)
        } else {
            command = spawn(path.replace('\\downloads\\', '\\') + `youtube-dl.exe`, args)
        }

        let data = '';
        let filenames = []
        let episodeName = '';
        let readData = false;
        let jsonPath = "";
        command.stdout.setEncoding('utf8');
        command.stdout.on('data', (chunk) => {
            let lines = chunk.split('\n')
            for (let i = 0; i < lines.length; i++) {
                //data += lines[i];
                if (readData) {
                    readData = false
                    setTimeout(() => {
                        fs.readFile(jsonPath, (err, data) => {
                            if (!err) {
                                jsonPath = ""
                                let obj = JSON.parse(data)
                                filenames.push(obj._filename)
                                episodeName = obj.playlist
                                chunksCallback(obj.n_entries)
                            } else {
                                console.log(err);
                            }
                        });
                    }, 100)
                }

                if (lines[i].includes("[info] Writing video description metadata as JSON to: ")) {
                    jsonPath = lines[i].replace("[info] Writing video description metadata as JSON to: ", "")
                    readData = true
                }

                if (lines[i].includes("[download] ")) {
                    //console.log(lines[i]);
                    let line = lines[i].replace("[download] ", "")
                    let percentage = line.substring(0, line.indexOf("%")).replace(" ", "")
                    let speed = line.substring(line.indexOf(" at ") + 4, line.indexOf(" ETA ")).replace(" ", "")
                    let eta = line.substring(line.indexOf(" ETA "), line.length).replace(" ", "")
                    progressCallback(percentage, speed, eta)
                } else {}

                if (lines[i].includes("[download] Downloading video ")) {
                    let currentChunk = lines[i].replace("[download] Downloading video ", "")
                    currentChunkCallback(currentChunk)
                }
                //console.log(lines[i].replace("\n", ""));
            }

            if (fs.existsSync(path + `SouthPark ${season}.${episode} - ${episodeName}.mkv`)) {
                console.log('Episode already downloaded! Aborting!');
                command.kill('SIGINT')
            }
        })

        let error = ''
        command.stderr.on('data', (chunk) => {
            error += chunk
            console.log(error);
        })

        command.on('error', err => {
            console.log(err);
            reject()
        })

        command.on('close', (code) => {
            console.log('finished: ' + code);
            resolve([data, error, filenames, episodeName, code])
        })
    })
}

async function merge(filenames, path, episodeName, season, episode) {
    return new Promise((resolve, reject) => {
        try {
            let files = []

            for (let i = 0; i < filenames.length; i++) {
                if (i == 0) {
                    files.push(`${filenames[i]}`)
                } else {
                    files.push(`+${filenames[i]}`)
                }
            }

            let args = files

            args.push('-o')
		
            var forbiddenCharacterRegex = /[\\/:"*?<>|]+/;

            if(episodeName.match(forbiddenCharacterRegex)) {
	        episodeName = episodeName.replace(forbiddenCharacterRegex, "_");
	        console.log('Replaced illegal characters. New filename: ' + episodeName);
            }
            
            args.push(`${path}SouthPark ${season}.${episode} - ${episodeName}.mkv`)

            let command;
            if (os == 'linux') {
                command = spawn(`mkvmerge`, args)
            } else {
                command = spawn(path.replace('\\downloads\\', '\\') + 'mkvmerge.exe', args)
            }

            let data = '';
            command.stdout.setEncoding('utf8');
            command.stdout.on('data', (chunk) => {
                data += chunk;
                console.log(data);
            })

            let error = ''
            command.stderr.on('data', (chunk) => {
                error += chunk
                console.log(error);
            })

            command.on('error', err => {
                console.log(err);
                reject()
            })

            command.on('close', (code) => {
                resolve([data, error])
            })
        } catch (error) {
            reject(error)
        }
    })
}

function deleteFiles(path) {
    findRemove(path, {
        extensions: ['.json', '.mp4', '.tmp', '.part', '.ytdl']
    })
}
