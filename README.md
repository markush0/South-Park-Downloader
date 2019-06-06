# README #



### What is this repository for? ###
This is a downloader for South Park Episodes from the official website.

It is currently in its early state.

------------------------------------

#### This tool is of course only for testing and demonstration purpose and should not be used to download episodes neither from [https://www.southpark.de/](https://www.southpark.de/) nor from [https://southpark.cc.com/](https://southpark.cc.com/). ####

------------------------------------

### Where do I get it? ###

Just visit the [Releases](https://github.com/flokol120/South-Park-Downloader/releases/) Page to download the compiled version.

### How do I install it? ###

#### Linux: ####

1. grab the newest compiled version from the [Releases](https://github.com/flokol120/South-Park-Downloader/releases/).
2. extract the archive.
3. install youtube-dl and mkvmerge (Debian: `apt-get install youtube-dl mkvtoolnix libav-tools python3 rtmpdump -y`, Ubuntu: `sudo apt install -y youtube-dl mkvtoolnix libav-tools python3 rtmpdump libgconf2-4`)
4. make the starter executable, either the GUI way or via the terminal (Debian: `chmod a+x south-park-downloader`, Ubuntu: `sudo chmod a+x south-park-downloader`)

#### Windows: ####

1. grab the newest compiled version from the [Releases](https://github.com/flokol120/South-Park-Downloader/releases/).
2. extract the archive.
3. place the `youtube-dl.exe` ([32bit](https://yt-dl.org/downloads/2018.07.10/youtube-dl.exe)) and the `mkvmerge.exe` ([32bit](https://www.fosshub.com/MKVToolNix.html/mkvtoolnix-32-bit-25.0.0.7z), [64bit](https://www.fosshub.com/MKVToolNix.html/mkvtoolnix-64-bit-25.0.0.7z)) in the main directory (name them like this if not by default)

#### MacOS: ####

##### not supported, feel free to test #####

### What other programs/libraries is this repository using? ###

* [youtube-dl](https://rg3.github.io/youtube-dl/) to download the three parts of an episode.
* [mkvmerge](https://mkvtoolnix.download/doc/mkvmerge.html) to merge the three downloaded parts.
* [electron](https://electronjs.org/) is the foundation of this program
* [handlebars](https://handlebarsjs.com/) is used to handle HTML templates
* [bootstrap](https://getbootstrap.com/) is used for the overall design

### Who do I talk to? ###

* Just contact me for any questions.
