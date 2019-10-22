var EventCenter = {
    on: function (type, handler) {
        $(document).on(type, handler)
    },
    fire: function (type, data) {
        $(document).trigger(type, data)
    }
}

var footer = {
    init: function () {
        this.$footer = $('footer')
        this.$ul = this.$footer.find('ul')
        this.$box = this.$footer.find('.box')
        this.$leftBtn = this.$footer.find('.icon-left')
        this.$rightBtn = this.$footer.find('.icon-right')
        this.isToEnd = false
        this.isToStart = true
        this.isAnimate = false
        this.bind()
        this.render()
    },
    bind: function () {
        var _this = this
        this.$rightBtn.on('click', function () {
            if (_this.isAnimate) return
            if (!_this.isToEnd) {
                var itemWidth = _this.$box.find('li').outerWidth(true)
                var rowCount = Math.floor(_this.$box.width() / itemWidth)
                _this.isAnimate = true
                _this.$ul.animate({
                    left: '-=' + itemWidth * rowCount
                }, 400, function () {
                    _this.isToStart = false
                    _this.isAnimate = false
                    // console.log(parseFloat(_this.$box.width()) - parseFloat(_this.$ul.css('left')))
                    // console.log(parseFloat(_this.$ul.width()))
                    // console.log(parseFloat(_this.$box.width()) - parseFloat(_this.$ul.css('left')) >= parseFloat(_this.$ul.width()))
                    if (parseFloat(_this.$box.width()) - parseFloat(_this.$ul.css('left')) >= parseFloat(_this.$ul.width())) {
                        _this.isToEnd = true
                    }
                })
            }
        })
        this.$leftBtn.on('click', function () {
            if (_this.isAnimate) return
            if (!_this.isToStart) {
                var itemWidth = _this.$box.find('li').outerWidth(true)
                var rowCount = Math.floor(_this.$box.width() / itemWidth)
                _this.isAnimate = true
                _this.$ul.animate({
                    left: '+=' + itemWidth * rowCount
                }, 400, function () {
                    _this.isToEnd = false
                    _this.isAnimate = false
                    // console.log(parseFloat(_this.$ul.css('left')))
                    if (parseFloat(_this.$ul.css('left')) >= 0) {
                        _this.isToStart = true
                    }
                })
            }
        })
        this.$footer.on('click', 'li', function () {
            $(this).addClass('active')
                .siblings().removeClass('active')
            // console.log($(this))
            EventCenter.fire('select-albumn', {
                channelId: $(this).attr('data-channel-id'),
                channelName: $(this).attr('data-channel-name')
            })
        })

    },
    render: function () {
        var _this = this
        $.getJSON("http://jirenguapi.applinzi.com/fm/getChannels.php")
            .done(function (ret) {
                // console.log(ret.channels)
                _this.renderFooter(ret.channels)
            }).fail(function () {
                console.log('error')
            });

    },
    renderFooter: function (channels) {
        var html = ''
        channels.forEach(function (channel) {
            html += '<li data-channel-id =' + channel.channel_id + ' data-channel-name=' + channel.name + '>' +
                '<div class="cover" style="background-image:url(' + channel.cover_small + ')"></div>' +
                '<h3>' + channel.name + '</h3>' +
                '</li>'
        })
        this.$ul.html(html)
        this.setStyle()
    },
    setStyle: function () {
        var count = this.$footer.find('li').length
        var width = this.$footer.find('li').outerWidth(true)
        // console.log(count, width)
        this.$ul.css({
            width: count * width + 'px'
        })
    }

}

var app = {
    init: function () {
        this.$container = $('#page-music main')
        this.audio = new Audio()
        this.clock = null
        this.audio.autoplay = true
        this.lyricObj = null
        this.bind()
    },
    bind: function () {
        var _this = this
        EventCenter.on('select-albumn', function (e, channel) {
            _this.channelId = channel.channelId
            _this.channelName = channel.channelName
            // console.log(channel)
            _this.loadMusic()
        })

        this.$container.find('.btn-play').on('click', function () {
            if ($(this).hasClass('icon-pause')) {
                $(this).removeClass('icon-pause').addClass('icon-play')
                _this.audio.pause()
            } else {
                $(this).removeClass('icon-play').addClass('icon-pause')
                _this.audio.play()
            }
        })
        this.audio.addEventListener('play', function () {
            clearInterval(_this.clock)
            _this.clock = setInterval(function () {
                _this.updateState()
                _this.setLyric()
            }, 1000)
            // console.log('play')
        })
        this.audio.addEventListener('pause', function () {
            // console.log('pause')
            clearInterval(_this.clock)
        })
        this.$container.find('.btn-next').on('click', function () {
            _this.loadMusic()

        })
    },
    loadMusic: function () {
        // console.log(this.channelId)
        var _this = this
        $.getJSON('//jirenguapi.applinzi.com/fm/getSong.php', {
                channel: this.channelId
            })
            .done(function (ret) {
                _this.setMusic(ret.song[0])
            })
    },
    setMusic: function (song) {
        // console.log(song)
        $('.bg').css('background-image', 'url(' + song.picture + ')')
        this.$container.find('.aside figure').css('background-image', 'url(' + song.picture + ')')
        this.$container.find('.detail h1').text(song.title)
        this.$container.find('.btn-play').removeClass('icon-play').addClass('icon-pause')
        this.$container.find('.detail .author').text(song.artist)
        this.$container.find('.tag').text(this.channelName)
        this.audio.src = song.url
        this.loadLyric(song.sid)
    },
    updateState: function () {
        var min = Math.floor(this.audio.currentTime / 60)
        var second = Math.floor(this.audio.currentTime % 60) + ''
        second = second.length === 2 ? second : '0' + second
        this.$container.find('.current-time').text(min + ':' + second)
        this.$container.find('.bar-progress').css('width', this.audio.currentTime / this.audio.duration * 100 + '%')
    },
    loadLyric: function (sid) {
        var _this = this
        $.getJSON('//jirenguapi.applinzi.com/fm/getLyric.php', {
                sid: sid
            })
            .done(function (ret) {
                var lyricObj = {}
                ret.lyric.split('\n').forEach(function (line) {
                    var timeArr = line.match(/\d{2}:\d{2}/g)
                    if (timeArr) {
                        timeArr.forEach(function (time) {
                            lyricObj[time] = line.replace(/\[.+?\]/g, '')
                        })
                    }
                })
                _this.lyricObj = lyricObj
            }).fail(function () {
                var lyricObj = {}
                console.log('error lyric')
            })
    },
    setLyric: function () {
        var timeStr = '0' + Math.floor(this.audio.currentTime / 60) + ':' +
            (Math.floor(this.audio.currentTime) % 60 / 100).toFixed(2).substr(2)
        if (this.lyricObj && this.lyricObj[timeStr]) {
            // var styles = ['slideInUp','zoomIn','rollIn', 'rotateIn', 'flipInX','fadeIn', 'bounceIn','swing', 'pulse']
            // var style = styles[Math.floor(Math.random()*styles.length)]
            this.$container.find('.lyric p').text(this.lyricObj[timeStr])
        } else {
            this.$container.find('.lyric p').text('')
        }
    },
}
footer.init()
app.init()