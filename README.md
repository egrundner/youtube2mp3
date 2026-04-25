# youtube2mp3
Simple Youtube to mp3 converter
YouTube2MP3

YouTube to MP3 Downloader with Graphical User Interface (GUI)

Features

Enter YouTube Video URL → Download as MP3
Real-time progress indicator
Choose output folder
Open folder after download
Automatic MP3 conversion
System Requirements

Linux (Debian/Ubuntu)
FFmpeg
Python 3
Installation

1. AppImage (recommended)

chmod +x YouTube2MP3-1.0.0.AppImage
./YouTube2MP3-1.0.0.AppImage
2. DEB package (Debian/Ubuntu)

sudo dpkg -i youtube2mp3_1.0.0_amd64.deb
# If dependencies are missing:
sudo apt-get install -f
Manual installation

# 1. Install dependencies
sudo apt install ffmpeg python3

# 2. Clone repository
git clone https://github.com/egrundner/youtube2mp3.git
cd youtube2mp3

# 3. Install and run
npm install
npm start
Build (create yourself)

npm install
npm run build
Output: dist/YouTube2MP3-1.0.0.AppImage and dist/youtube2mp3_1.0.0_amd64.deb

License

MIT License
