var musicList = [{
        src: 'http://cloud.hunger-valley.com/music/玫瑰.mp3',
        title: '玫瑰',
        auther: '贰佰'
    },
    {
        src: 'http://cloud.hunger-valley.com/music/ifyou.mp3',
        title: 'IF YOU',
        auther: 'Big Bang'
    }
]
var backBtn = document.querySelector('.musicbox .back')
var playBtn = document.querySelector('.musicbox .play')
var forwardBtn = document.querySelector('.musicbox .forward')
var titleNode = document.querySelector('.musicbox .title')
var authorNode = document.querySelector('.musicbox .auther')
var timeNode = document.querySelector('.musicbox .time')
var progressBarNode = document.querySelector('.musicbox .progress .bar')
var progressNowNode = document.querySelector('.musicbox .progress-now')
var timer

var music = new Audio()
music.autoplay = true
var musicIndex = 0

loadMusic(musicList[musicIndex])

playBtn.onclick = function () {
    var icon = this.querySelector('.fa')
    console.log(icon)
    if (icon.classList.contains('fa-play')) {
        music.play()
    } else {
        music.pause()
    }
    icon.classList.toggle('fa-play')
    icon.classList.toggle('fa-pause')
}

forwardBtn.onclick = loadNextMusic
backBtn.onclick = loadLastMusic
music.onended = loadNextMusic
music.shouldUpdate = true


music.onplaying = function () {
    timer = setInterval(function () {
        updateProgress()
    }, 1000)
    console.log('play')
}
music.onpause = function () {
    console.log('pause')
    clearInterval(timer)
}

progressBarNode.onclick = function (e) {
    var percent = e.offsetX / parseInt(getComputedStyle(this).width)
    music.currentTime = percent * music.duration
    progressNowNode.style.width = percent * 100 + "%"
}

function loadMusic(songObj) {
    music.src = songObj.src
    titleNode.innerText = songObj.title
    authorNode.innerText = songObj.auther
}

function loadNextMusic() {
    musicIndex++
    musicIndex = musicIndex % musicList.length
    loadMusic(musicList[musicIndex])
}

function loadLastMusic() {
    musicIndex--
    musicIndex = (musicIndex + musicList.length) % musicList.length
    loadMusic(musicList[musicIndex])
}

function updateProgress() {
    var percent = (music.currentTime / music.duration) * 100 + '%'
    progressNowNode.style.width = percent
    var minutes = parseInt(music.currentTime / 60)
    var seconds = parseInt(music.currentTime % 60) + ''
    seconds = seconds.length == 2 ? seconds : '0' + seconds
    timeNode.innerText = minutes + ':' + seconds
}