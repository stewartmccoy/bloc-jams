(function(/*! Brunch !*/) {
  'use strict';

  var globals = typeof window !== 'undefined' ? window : global;
  if (typeof globals.require === 'function') return;

  var modules = {};
  var cache = {};

  var has = function(object, name) {
    return ({}).hasOwnProperty.call(object, name);
  };

  var expand = function(root, name) {
    var results = [], parts, part;
    if (/^\.\.?(\/|$)/.test(name)) {
      parts = [root, name].join('/').split('/');
    } else {
      parts = name.split('/');
    }
    for (var i = 0, length = parts.length; i < length; i++) {
      part = parts[i];
      if (part === '..') {
        results.pop();
      } else if (part !== '.' && part !== '') {
        results.push(part);
      }
    }
    return results.join('/');
  };

  var dirname = function(path) {
    return path.split('/').slice(0, -1).join('/');
  };

  var localRequire = function(path) {
    return function(name) {
      var dir = dirname(path);
      var absolute = expand(dir, name);
      return globals.require(absolute, path);
    };
  };

  var initModule = function(name, definition) {
    var module = {id: name, exports: {}};
    cache[name] = module;
    definition(module.exports, localRequire(name), module);
    return module.exports;
  };

  var require = function(name, loaderPath) {
    var path = expand(name, '.');
    if (loaderPath == null) loaderPath = '/';

    if (has(cache, path)) return cache[path].exports;
    if (has(modules, path)) return initModule(path, modules[path]);

    var dirIndex = expand(path, './index');
    if (has(cache, dirIndex)) return cache[dirIndex].exports;
    if (has(modules, dirIndex)) return initModule(dirIndex, modules[dirIndex]);

    throw new Error('Cannot find module "' + name + '" from '+ '"' + loaderPath + '"');
  };

  var define = function(bundle, fn) {
    if (typeof bundle === 'object') {
      for (var key in bundle) {
        if (has(bundle, key)) {
          modules[key] = bundle[key];
        }
      }
    } else {
      modules[bundle] = fn;
    }
  };

  var list = function() {
    var result = [];
    for (var item in modules) {
      if (has(modules, item)) {
        result.push(item);
      }
    }
    return result;
  };

  globals.require = require;
  globals.require.define = define;
  globals.require.register = define;
  globals.require.list = list;
  globals.require.brunch = true;
})();
require.register("scripts/album", function(exports, require, module) {
// Another Example Album
var albumMarconi = {
    name: 'The Telephone',
    artist: 'Guglielmo Marconi',
    label: 'EM',
    year: '1909',
    albumArtUrl: '/images/album-placeholder.png',
    songs: [
        { name: 'Hello, Operator?', length: '1:01' },
        { name: 'Ring, ring, ring', length: '5:01' },
        { name: 'Fits in your pocket', length: '3:21'},
        { name: 'Can you hear me now?', length: '3:14' },
        { name: 'Wrong phone number', length: '2:15'}
    ]
};

var currentlyPlayingSong = null;

var createSongRow = function(songNumber, songName, songLength) {
  var template =
      '<tr>'
    + '  <td class="song-number col-md-1" data-song-number="' + songNumber + '">' + songNumber + '</td>'
    + '  <td class="col-md-9">' + songName + '</td>'
    + '  <td class="col-md-2">' + songLength + '</td>'
    + '</tr>'
    ;

    // Instead of returning the row immediately, we'll attach hover
    // functionality to it first.
    var $row = $(template);

    // Change from a song number to play button when the song isn't playing and we hover over the row.
    var onHover = function(event) {
        var songNumberCell = $(this).find('.song-number');
        var songNumber = songNumberCell.data('song-number');
        if (songNumber !== currentlyPlayingSong) {
            songNumberCell.html('<a class="album-song-button"><i class="fa fa-play"></i></a>');
        }
    };

    // Change from a play button to song number when the song isn't playing and we hover off the row.
    var offHover = function(event) {
        var songNumberCell = $(this).find('.song-number');
        var songNumber = songNumberCell.data('song-number');
        if (songNumber !== currentlyPlayingSong) {
            songNumberCell.html(songNumber);
        }
    };

    // Toggle the play, pause, and song number based on which play/pause button we clicked on.
    var clickHandler = function(event) {
        var songNumber = $(this).data('song-number');

        if (currentlyPlayingSong !== null) {
            // Revert to song number for currently playing song because user started playing new song.
            currentlyPlayingCell = $('.song-number[data-song-number="' + currentlyPlayingSong + '"]');
            currentlyPlayingCell.html(currentlyPlayingSong);
        }

        if (currentlyPlayingSong !== songNumber) {
            // Switch from Play -> Pause button to indicate new song is playing.
            $(this).html('<a class="album-song-button"><i class="fa fa-pause"></i></a>');
            currentlyPlayingSong = songNumber;
        }

        else if (currentlyPlayingSong === songNumber) {
        // Switch from Pause -> Play button to pause currently playing song.
        $(this).html('<a class="album-song-button"><i class="fa fa-play"></i></a>');
        currentlyPlayingSong = null;
        }
    };

    $row.find('.song-number').click(clickHandler);
    $row.hover(onHover, offHover);
    return $row;
};

var changeAlbumView = function(album) {
    // Update the album title
    var $albumTitle = $('.album-title');
    $albumTitle.text(album.name);

    // Update the album artist
    var $albumArtist = $('.album-artist');
    $albumArtist.text(album.artist);

    // Update the meta information
    var $albumMeta = $('.album-meta-info');
    $albumMeta.text(album.year + " on " + album.label);

    // Update the album image
    var $albumImage = $('.album-image img');
    $albumImage.attr('src', album.albumArtUrl);

    // Update the Song List
    var $songList = $(".album-song-listing");
    $songList.empty();
    var songs = album.songs;
    for (var i = 0; i < songs.length; i++) {
        var songData = songs[i];
        var $newRow = createSongRow(i + 1, songData.name, songData.length);
        $songList.append($newRow);
    }
};

// This 'if' condition is used to prevent the jQuery modifications
// from happening on non-Album view pages.
//  - Use a regex to validate that the url has "/album" in its path.
if (document.URL.match(/\/album.html/)) {
    // Wait until the HTML is fully processed.
    $(document).ready(function() {
        changeAlbumView(albumMarconi);
        setupSeekBars();
        var onClickChangeAlbumView = function() {
            changeAlbumView(albumPicasso);
        };

        $('.album-placeholder').click(function() {
            onClickChangeAlbumView();
        });
    });
}

});

;require.register("scripts/app", function(exports, require, module) {
// require("./landing");
// require("./collection");
// require("./album");
// require("./profile");

// Example Album
var albumPicasso = {
    name: 'The Colors',
    artist: 'Pablo Picasso',
    label: 'Cubism',
    year: '1881',
    albumArtUrl: '/images/album-placeholder.png',
    songs: [
      { name: 'Blue', length: 163.38, audioUrl: '/music/placeholders/blue' },
      { name: 'Green', length: 105.66 , audioUrl: '/music/placeholders/green' },
      { name: 'Red', length: 270.14, audioUrl: '/music/placeholders/red' },
      { name: 'Pink', length: 154.81, audioUrl: '/music/placeholders/pink' },
      { name: 'Magenta', length: 375.92, audioUrl: '/music/placeholders/magenta' }
    ]
};

blocJams = angular.module('BlocJams', ['ui.router']);

blocJams.config(['$stateProvider', '$locationProvider', function($stateProvider, $locationProvider) {
    $locationProvider.html5Mode(true);

    $stateProvider
        .state('landing', {
            url: '/',
            controller: 'Landing.controller',
            templateUrl: '/templates/landing.html'
        })
        .state('song', {
            url: '/song',
            templateUrl: '/templates/song.html'
        })
        .state('collection', {
            url: '/collection',
            controller: 'Collection.controller',
            templateUrl: '/templates/collection.html'
        })
        .state('album', {
            url: '/album',
            controller: 'Album.controller',
            templateUrl: '/templates/album.html'
        });
}]);

blocJams.controller('Landing.controller', ['$scope', function($scope) {
    $scope.headerText = "Bloc Jams";
    $scope.subText = "Turn the music up!";

    function shuffle(o){ //v1.0
        for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
        return o;
    };

    $scope.subTextClicked = function() {
        $scope.subText += '!';
    };

    $scope.albumURLs = [
        '/images/album-placeholders/album-1.jpg',
        '/images/album-placeholders/album-2.jpg',
        '/images/album-placeholders/album-3.jpg',
        '/images/album-placeholders/album-4.jpg',
        '/images/album-placeholders/album-5.jpg',
        '/images/album-placeholders/album-6.jpg',
        '/images/album-placeholders/album-7.jpg',
        '/images/album-placeholders/album-8.jpg',
        '/images/album-placeholders/album-9.jpg',
    ];

    $scope.headerTextClicked = function() {
        return shuffle($scope.albumURLs);
    };
}]);

blocJams.controller('Collection.controller', ['$scope', function($scope) {
    $scope.albums = [];
    for (var i = 0; i < 33; i++) {
        $scope.albums.push(angular.copy(albumPicasso));
    }

    $scope.playAlbum = function(album){
      SongPlayer.setSong(album, album.songs[0]); // Targets first song in the array.
    };
}])

blocJams.controller('Album.controller', ['$scope', 'SongPlayer', function($scope, SongPlayer) {
  $scope.album = angular.copy(albumPicasso);

  var hoveredSong = null;

  $scope.onHoverSong = function(song) {
    hoveredSong = song;
  };

  $scope.offHoverSong = function(song) {
    hoveredSong = null;
  };

  $scope.getSongState = function(song) {
     if (song === SongPlayer.currentSong && SongPlayer.playing) {
       return 'playing';
     }
     else if (song === hoveredSong) {
       return 'hovered';
     }
     return 'default';
   };

   $scope.playSong = function(song) {
    SongPlayer.setSong($scope.album, song);
   };

   $scope.pauseSong = function(song) {
     SongPlayer.pause();
   };
}]);

blocJams.controller('PlayerBar.controller', ['$scope', 'SongPlayer', function($scope, SongPlayer) {
  $scope.songPlayer = SongPlayer;

  $scope.volumeClass = function() {
    return {
      'fa-volume-off': SongPlayer.volume == 0,
      'fa-volume-down': SongPlayer.volume <= 70 && SongPlayer.volume > 0,
      'fa-volume-up': SongPlayer.volume > 70
    }
  };

  $scope.mute = function() {
    var volume = this.songPlayer.volume;

    if (volume !== 0 ) {
      var volumeBeforeMute = volume;
    }

    if ((this.songPlayer.playing === true) && (this.songPlayer.volume !== 0)) {
      this.songPlayer.setVolume(0);
      this.songPlayer.volumeBeforeMute = volumeBeforeMute;
    } else {
      this.songPlayer.setVolume(this.songPlayer.volumeBeforeMute);
    };

  };

  SongPlayer.onTimeUpdate(function(event, time){
    $scope.$apply(function(){
      $scope.playTime = time;
    });
  });
}]);

blocJams.service('SongPlayer', ['$rootScope', function($rootScope) {
  var currentSoundFile = null;

  var trackIndex = function(album, song) {
    return album.songs.indexOf(song);
  };

  return {
    currentSong: null,
    currentAlbum: null,
    playing: false,
    volume: 90,

    play: function() {
      this.playing = true;
      currentSoundFile.play();
    },
    pause: function() {
      this.playing = false;
      currentSoundFile.pause();
    },
    next: function() {
      var currentTrackIndex = trackIndex(this.currentAlbum, this.currentSong);
      console.log(currentTrackIndex);
      currentTrackIndex++;
      if (currentTrackIndex >= this.currentAlbum.songs.length) {
       currentTrackIndex = 0;
      }
      var song = this.currentAlbum.songs[currentTrackIndex];
      this.setSong(this.currentAlbum, song);
    },
    previous: function() {
      var currentTrackIndex = trackIndex(this.currentAlbum, this.currentSong);
      currentTrackIndex--;
      if (currentTrackIndex < 0) {
        currentTrackIndex = this.currentAlbum.songs.length - 1;
      }

      var song = this.currentAlbum.songs[currentTrackIndex];
      this.setSong(this.currentAlbum, song);
    },
    seek: function(time) {
      // Checks to make sure that a sound file is playing before seeking.
      if(currentSoundFile) {
        // Uses a Buzz method to set the time of the song.
        currentSoundFile.setTime(time);
      }
    },
    onTimeUpdate: function(callback) {
      return $rootScope.$on('sound:timeupdate', callback);
    },
    setVolume: function(volume) {
      if(currentSoundFile){
        currentSoundFile.setVolume(volume);
      }
      this.volume = volume;
    },
    setSong: function(album, song) {
      if (currentSoundFile) {
        currentSoundFile.stop();
      }
      this.currentAlbum = album;
      this.currentSong = song;

      currentSoundFile = new buzz.sound(song.audioUrl, {
        formats: [ "mp3" ],
        preload: true
      });

      currentSoundFile.setVolume(this.volume);

      currentSoundFile.bind('timeupdate', function(e){
        $rootScope.$broadcast('sound:timeupdate', this.getTime());
      });

      this.play();
    }
  };
}]);

blocJams.directive('slider', ['$document', function($document){
  // Returns a number between 0 and 1 to determine where the mouse event happened along the slider bar.
  var calculateSliderPercentFromMouseEvent = function($slider, event) {
    var offsetX =  event.pageX - $slider.offset().left; // Distance from left
    var sliderWidth = $slider.width(); // Width of slider
    var offsetXPercent = (offsetX  / sliderWidth);
    offsetXPercent = Math.max(0, offsetXPercent);
    offsetXPercent = Math.min(1, offsetXPercent);
    return offsetXPercent;
  }

  var numberFromValue = function(value, defaultValue) {
    if (typeof value === 'number') {
      return value;
    }

    if(typeof value === 'undefined') {
      return defaultValue;
    }

    if(typeof value === 'string') {
      return Number(value);
    }
  }

  return {
    templateUrl: '/templates/directives/slider.html', // We'll create these files shortly.
    replace: true,
    restrict: 'E',
    scope: {
      onChange: '&'
    },
    link: function(scope, element, attributes) {
      // These values represent the progress into the song/volume bar, and its max value.
      // For now, we're supplying arbitrary initial and max values.
      scope.value = 0;
      scope.max = 100;
      var $seekBar = $(element);

      attributes.$observe('value', function(newValue) {
        scope.value = numberFromValue(newValue, 0);
      });

      attributes.$observe('max', function(newValue) {
        scope.max = numberFromValue(newValue, 100) || 100;
      });

      var percentString = function () {
        var value = scope.value || 0;
        var max = scope.max || 100;
        percent = value / max * 100;
        return percent + "%";
      };

      scope.fillStyle = function() {
        return {width: percentString()};
      };

      scope.thumbStyle = function() {
        return {left: percentString()};
      };

      scope.onClickSlider = function(event) {
        var percent = calculateSliderPercentFromMouseEvent($seekBar, event);
        scope.value = percent * scope.max;
        notifyCallback(scope.value);
      };

      scope.trackThumb = function() {
        $document.bind('mousemove.thumb', function(event){
          var percent = calculateSliderPercentFromMouseEvent($seekBar, event);
          scope.$apply(function(){
            scope.value = percent * scope.max;
            notifyCallback(scope.value);
          });
        });

        //cleanup
        $document.bind('mouseup.thumb', function(){
          $document.unbind('mousemove.thumb');
          $document.unbind('mouseup.thumb');
        });
      };

      var notifyCallback = function(newValue) {
        if(typeof scope.onChange === 'function') {
          scope.onChange({value: newValue});
        }
      };
    }
  };
}]);

blocJams.filter('timecode', function(){
  return function(seconds) {
    seconds = Number.parseFloat(seconds);

    // Returned when no time is provided.
    if (Number.isNaN(seconds)) {
      return '-:--';
    }

    // make it a whole number
    var wholeSeconds = Math.floor(seconds);

    var minutes = Math.floor(wholeSeconds / 60);

    remainingSeconds = wholeSeconds % 60;

    var output = minutes + ':';

    // zero pad seconds, so 9 seconds should be :09
    if (remainingSeconds < 10) {
      output += '0';
    }

    output += remainingSeconds;

    return output;
  }
});

});

;require.register("scripts/collection", function(exports, require, module) {
var buildAlbumThumbnail = function() {
   var template =
       '<div class="collection-album-container col-md-2">'
     + '  <div class="collection-album-image-container">'
     + '    <img src="/images/album-placeholder.png"/>'
     + '  </div>'
     + '  <div class="caption album-collection-info">'
     + '    <p>'
     + '      <a class="album-name" href="/album.html"> Album Name </a>'
     + '      <br/>'
     + '      <a href="/album.html"> Artist name </a>'
     + '      <br/>'
     + '      X songs'
     + '      <br/>'
     + '      X:XX Total Length'
     + '      <br/>'
     + '    </p>'
     + '  </div>'
     + '</div>';

  return $(template);
};

var updateCollectionView = function() {
    var $collection = $(".collection-container .row");
    $collection.empty();

    var randomNum = Math.floor((Math.random() * 100) + 1);

    for (var i = 0; i < randomNum; i++) {
        var $newThumbnail = buildAlbumThumbnail();
        $collection.append($newThumbnail);
    }

    var onHover = function(event) {
        $(this).append(buildAlbumOverlay("/album.html"));
    };

    var offHover = function(event) {
        $(this).find('.collection-album-image-overlay').remove();
    };

    $collection.find('.collection-album-image-container').hover(onHover, offHover);
};

if (document.URL.match(/\/collection.html/)) {
    // Wait until the HTML is fully processed.
    $(document).ready(function() {
        updateCollectionView();
    });
};

var buildAlbumOverlay = function(albumURL) {
  var template =
      '<div class="collection-album-image-overlay">'
    + '  <div class="collection-overlay-content">'
    + '    <a class="collection-overlay-button" href="' + albumURL + '">'
    + '      <i class="fa fa-play"></i>'
    + '    </a>'
    + '    &nbsp;'
    + '    <a class="collection-overlay-button">'
    + '      <i class="fa fa-plus"></i>'
    + '    </a>'
    + '  </div>'
    + '</div>'
    ;
  return $(template);
};

});

;require.register("scripts/landing", function(exports, require, module) {
$(document).ready(function() {
    $('.hero-content h3').click(function(){
        console.log("hello!");
        var subText = $(this).text();
        $(this).text(subText + "!");
    });

    var onHoverAction = function(event) {
        console.log('Hover action triggered.');
        $(this).animate({'margin-top': '10px'});
    };

    var offHoverAction = function(event) {
        console.log('Off-hover action triggered.');
        $(this).animate({'margin-top': '0px'});
    };

    $('.selling-points .point').hover(onHoverAction, offHoverAction);
});

});

;require.register("scripts/profile", function(exports, require, module) {
// holds the name of our tab button container for selection later in the function
var tabsContainer = ".user-profile-tabs-container";
var selectTabHandler = function(event) {
    $tab = $(this);
    $(tabsContainer + " li").removeClass('active');
    $tab.parent().addClass('active');
    selectedTabName = $tab.attr('href');
    console.log(selectedTabName);
    $(".tab-pane").addClass('hidden');
    $(selectedTabName).removeClass('hidden');
    event.preventDefault();
};


if (document.URL.match(/\/profile.html/)) {
    $(document).ready(function() {
        var $tabs = $(tabsContainer + " a");
        $tabs.click(selectTabHandler);
        $tabs[0].click();
    });
}

});

;
//# sourceMappingURL=app.js.map