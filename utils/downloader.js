const youtubedl = require('youtube-dl')
const { spawn } = require('child_process');


const germanLink = 'https://www.southpark.de/alle-episoden/s0'

module.exports.downloadEpisode = async function downloadEpisode(season, episode, german, english, path, callback) {
    if (german && english) {

    } else if (english) {

        const { spawn } = require('child_process');
        const child = spawn('ls', ['-lh', '/usr']);

        // use child.stdout.setEncoding('utf8'); if you want text chunks
        var data = '';
        child.stdout.on('data', (chunk) => {
            // data from standard output is here as buffers
            data += chunk;
            console.log(data);

        });

        child.on('close', (code) => {
            console.log(`child process exited with code ${code}`);
        });

    } else {
        var link = germanLink + season + 'e0' + episode;

        var output = '--output'

        var outputName = path + "temp%(title)s.%(ext)s"


        console.log(`youtube-dl ${link} ${output} ${outputName}`);

        download(link, outputName, (data, error, filenames, episodeName) => {
            merge(filenames, path, episodeName, season, episode, (data, error) => {

            })
        })
    }
}

function download(link, output, callback) {
    let command = spawn(`youtube-dl`, [link, '--newline', '--print-json', '-o', output])

    let data = '';
    let filenames = []
    let episodeName = '';
    command.stdout.setEncoding('utf8');
    command.stdout.on('data', (chunk) => {
        data += chunk;
        var obj = JSON.parse(chunk)
        filenames.push(obj._filename);
        episodeName = obj.playlist
    })

    let error = ''
    command.stderr.on('data', (chunk) => {
        error += chunk
        console.log(error);
    })

    command.on('close', (code) => {
        console.log('finished: ' + code);
        callback(data, error, filenames, episodeName)
    })
}

function merge(filenames, path, episodeName, season, episode, callback) {
    var files = []

    for(let i = 0; i < filenames.length; i++){
        if(i == 0){
            files.push(`${filenames[i]}`)
        }else{
            files.push(`+${filenames[i]}`)
        }
    }

    var args = files

    console.log(episodeName);
    

    args.push('-o')
    args.push(`${path}SouthPark ${season}.${episode} - ${episodeName}.mkv`)

    console.log(args);
    

    var command = spawn(`mkvmerge`, args)

    var data = '';
    command.stdout.setEncoding('utf8');
    command.stdout.on('data', (chunk) => {
        data += chunk;
        console.log(data);
    })

    var error = ''
    command.stderr.on('data', (chunk) => {
        error += chunk
        console.log(error);
    })

    command.on('close', (code) => {
        callback(data, error)
    })
}