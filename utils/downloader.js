const {
    spawn
} = require('child_process');
const umlautMap = {
    '\u00dc': 'UE',
    '\u00c4': 'AE',
    '\u00d6': 'OE',
    '\u00fc': 'ue',
    '\u00e4': 'ae',
    '\u00f6': 'oe',
    '\u00df': 'ss',
}
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
        console.log(episodeLink);

        let [resolutionWidth, errorResolution] = await getBestResolutionWidth(episodeLink, path)

        let [dataDownload, errorDownload, filenames, episodeName, code] = await download(episodeLink, path, "temp%(title)s.%(ext)s", season, episode, resolutionWidth, progressCallback, chunksCallback, currentChunkCallback)

        if (code == 0 || code == 1) {
            mergingCallback();
            console.log(filenames);
            console.log(path);
            var mapping = await getMergeMapping(filenames, path);

            let [dataMerge, errorMerge] = await merge(filenames, mapping, path, episodeName, season, episode)

            deleteFiles(path)

            callback(dataDownload, errorDownload, dataMerge, errorMerge, episodeName)
        }
    }
}

function replaceUmlaute(str) {
    return str
        .replace(/[\u00dc|\u00c4|\u00d6][a-z]/g, (a) => {
            const big = umlautMap[a.slice(0, 1)];
            return big.charAt(0) + big.charAt(1).toLowerCase() + a.slice(1);
        })
        .replace(new RegExp('['+Object.keys(umlautMap).join('|')+']',"g"),
            (a) => umlautMap[a]
        );
}

// the single parts are available with different resolutions. Not always the best resolution is marked as 'best'. It appears that youtube-dl takes not the best or even differnet resolutions for the part files.
// This function detects the best available resolution width which can be passed to the download function.
async function getBestResolutionWidth(link, path) {
    return new Promise((resolve, reject) => {
        let command;
        if (os == 'linux') {
            command = spawn(`youtube-dl`, [link, '-F'])
        } else {
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

            for (var i = 0; i < lines.length; i++) {
               var line = lines[i].match(myRegexp);

               if (line != null) {
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

            if (resolutionTriplets.length == 0) {
                console.log('No equal resolutions for the 3 subparts could be found.' + data);
                reject()
            }

            var resolutionWidth = Math.max.apply(Math, resolutionTriplets.map(Number));

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
                                episodeName = replaceUmlaute(episodeName);
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

            if (fs.existsSync(path + `S${season}E${episode} - SouthPark - ${episodeName}.mkv`)) {
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

// Finds out the mapping which is used for merging the single video parts.
async function getMergeMapping(filenames, path) {
    var allTrackIds = [];

    for (i = 0; i < filenames.length; i++) {
        let [trackIds, errorTrackIds] = await getTrackIds(filenames[i], path);
        allTrackIds.push(trackIds);
    }

    var mapping = "";

    for (i = 1; i < allTrackIds.length; i++) {
        var videoId = allTrackIds[i - 1][0];
        var audioId = allTrackIds[i - 1][1];

        if (allTrackIds[i][0] == videoId) {
            mapping += i + ':' + videoId + ':' + (i - 1) + ':' + videoId + ','
            mapping += i + ':' + audioId + ':' + (i - 1) + ':' + audioId + ','
        } else {
            mapping += i + ':' + audioId + ':' + (i - 1) + ':' + videoId + ','
            mapping += i + ':' + videoId + ':' + (i - 1) + ':' + audioId + ','
        }
    }

    return mapping.slice(0, -1);
}

// Finds out the order of video and audio tracks of a single video part
async function getTrackIds(filename, path) {
    return new Promise((resolve, reject) => {
        let command;
        var args = ['-i', filename];

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
            var lines = data.split('\n');
            var myRegexp = /ID (\d): (video|audio)/;
            var video;
            var audio;

            for (var i = 0; i < lines.length; i++) {
                var line = lines[i].match(myRegexp);

                if (line == null) {
                    continue;
                }

                if (line.includes("video")) {
                    video = line[1];
                }

                if (line.includes("audio")) {
                    audio = line[1];
                }
            }

            resolve([[video, audio], error])
        })
    })
}

async function merge(filenames, mapping, path, episodeName, season, episode) {
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
		
            var forbiddenCharacterRegex = /[\\/:"*?<>|äöü!]+/;

            if (episodeName.match(forbiddenCharacterRegex)) {
	            episodeName = episodeName.replace(forbiddenCharacterRegex, "_");
	            console.log('Replaced illegal characters. New filename: ' + episodeName);
            }
            
            args.push(`${path}S${season}E${episode} - SouthPark - ${episodeName}.mkv`)
            args.push('--append-to');
            args.push(mapping);
            console.log(args);

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
