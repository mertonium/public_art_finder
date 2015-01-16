var MuralApp = {};

(function(m){
  m.App = function(configDoc) {
    var _self = {}, _pages;

    _self.config = _.defaults(configDoc, {
      mapTarget: '#map-target',
      listTarget: '#list-container',
      detailTarget: '#detail-container',
      detailHeader: '#detail-header',
      muralIcon: 'images/mosaic-marker.png',
      locationIcon: 'images/location-icon-pin-32.png'
    });

    console.log(_self.config);

    var defaultCenter = {
      lat : _self.config.default_lat || 37.7749295,
      lng : _self.config.default_lng || -122.4194155
    };

    //Map Styles
    var _mapTypeName = 'Map',
    _mapTypeDef = [{featureType: "road",elementType: "all",stylers: [{ saturation: -99 },{ hue: "#0000ff" }]},{featureType: "all",elementType: "labels",stylers: [{ visibility: "simplified" }]},{featureType: "road",elementType: "geometry",stylers: [{ visibility: "simplified" }]},{featureType: "road.local",elementType: "labels",stylers: [{ visibility: "on" }]},{featureType: "all",elementType: "geometry",stylers: [{ saturation: -20 }]}],
    _mapOptions = {
      zoom: 16,
      // PHL 39.95185, -75.16382  SF 37.7749295, -122.4194155
      center: new google.maps.LatLng(defaultCenter.lat, defaultCenter.lng),
      mapTypeId: _mapTypeName,
      mapTypeControlOptions: {
         mapTypeIds: [_mapTypeName, google.maps.MapTypeId.SATELLITE, google.maps.MapTypeId.HYBRID]
      }
    },

    //Map objects
    _map,
    _markers = [],
    _lastSearchLatLng,
    _myLocationLatLng,
    _myLocationMarker,
    _infoWindow = new InfoBox(),
    _directionsService = new google.maps.DirectionsService(),

    //Mural cache
    _murals = [];

    var _clearMarkers = function() {
        for(var i=0; i < _markers.length; i++) {
            _markers[i].setMap(null);
        }
        _markers = [];
    };

    var _addMarker = function(mural) {
        var latLng = new google.maps.LatLng(mural.geometry.coordinates[1], mural.geometry.coordinates[0]);
        var marker = new google.maps.Marker({
            map: _map,
            position: latLng,
            icon: _self.config.muralIcon
        });
        _markers.push(marker);

        google.maps.event.addListener(marker, "click", function() {
            var thumbnail = mural.properties.thumb || mural.properties.imgs[0];
            // Build the html for our GMaps infoWindow
            var bubbleHtml = '';
            bubbleHtml += '<strong>'+mural.properties.title+'</strong><br />';
            bubbleHtml += '<img class="thumbnail" src="'+thumbnail+'" />';
            bubbleHtml = '<div id="mid-'+mural.properties._id+'" class="infoBubbs">'+bubbleHtml+'</div><br style="clear:both" />';

            // Evidently we need to create the div the old fashioned way
            // for the infoWindow.
            var bubbs = document.createElement("div");
            bubbs.className = 'bubbleWrap';
            bubbs.innerHTML = bubbleHtml;

            $(bubbs).find('.infoBubbs').bind('tap',function(ev) {
                // The id of the element is in the form mid-XX where XX is the assetId.
                var pieces = this.id.split('-');

                // Build our url
                var url = 'details.html?id='+pieces[1];

                // Manually change the page
                $.mobile.changePage(url);
            });

            var winContent = '<div class="win-content">' +
              '<div class="win-title">'+mural.properties.title+'</div>' +
              '<img src="'+thumbnail+'" />' +
              '<a href="javascript:void(0);" data-assetid="'+mural.properties._id+
                  '" class="win-details-link">More details...</a>' +
            '</div>';

            var newOffset = new google.maps.Size(-68,0,'px','px');
            var winOptions = {
                content: bubbs,
                enableEventPropagation: true,
                position: latLng,
                pixelOffset: newOffset,
                closeBoxMargin: '18px 8px 2px 2px'
            };

            _infoWindow.setOptions(winOptions);
            _infoWindow.open(_map, marker);

            $('.win-details-link').bind('tap',function(ev) {
                // Build our url
                var url = 'details.html?id='+$(this).attr('data-assetid');

                // Manually change the page
                $.mobile.changePage(url);
            });
        });
    };

    var _refreshMarkers = function(){
        _clearMarkers();
        _infoWindow.close();

        // Add points to the map
        $.each(_murals, function(i, mural){
            if(mural && mural.geometry) {
                _addMarker(mural);
            }
        });
    };

    var calcDistance = function(mural, skip_echo) {
      skip_echo = skip_echo || false;
      var request = {
        origin:_myLocationLatLng,
        destination: new google.maps.LatLng(mural.geometry.coordinates[1], mural.geometry.coordinates[0]),
        travelMode: google.maps.DirectionsTravelMode.WALKING
      };

      mural.distance = parseFloat(quickDist(_myLocationLatLng.lat(), _myLocationLatLng.lng(), mural.geometry.coordinates[1], mural.geometry.coordinates[0]), 10);
//      if(!skip_echo) $('.mural-dist-'+mural.properties._id).text('You are ' + mural.distance + ' km away.');

      // _directionsService.route(request, function(result, status) {
      //         if (status == google.maps.DirectionsStatus.OK) {
      //           if(!skip_echo) $('.mural-dist-'+mural.properties._id).text('You are ' + result.routes[0].legs[0].distance.text + ' away.');
      //           mural.distance = parseFloat(result.routes[0].legs[0].distance.text, 10);
      //         }
      //       });
    };

    // http://www.movable-type.co.uk/scripts/latlong.html
    var quickDist = function(lat1, lon1, lat2, lon2) {
      var R = 6371; // km
      var d = Math.acos(Math.sin(lat1)*Math.sin(lat2) +
                        Math.cos(lat1)*Math.cos(lat2) *
                        Math.cos(lon2-lon1)) * R;
      return d;
    };


    var _refreshDetailList = function() {
      var $list = $(_self.config.listTarget).empty(),
        html = '<ul id="artlisting" data-role="listview" data-inset="true" data-theme="d">';

      $.each(_murals, function(i, mural){
          var thumbnail = mural.properties.thumb || mural.properties.imgs[0];
          html += '<li><img class="thumbnail" src="'+thumbnail+'" alt="'+mural.properties.title + '" class="ul-li-icon">' +
              '<a href="details.html?id='+ mural.properties._id +'">' + mural.properties.title + '</a>';

          if (_myLocationLatLng) {
            html += '<div class="mural-dist-'+mural.properties._id + ' distance"></div>';
          }
          html += '</li>';
      });
      html += '</ul>';
      $list.html(html);


      if (_myLocationLatLng) {
        $.each(_murals, function(i, mural) {
          calcDistance(mural);
        });
      }
      $list.find('ul').listview();
    };

    // Where are we?
    _self.findMe = function() {

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition( function(position) {
                var latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

                //Clear the marker if it exists
                if(_myLocationMarker) {
                  _myLocationMarker.setMap(null);
                }

                _myLocationLatLng = latLng;

                //Add a marker on my current location
                _myLocationMarker = new google.maps.Marker({
                    map: _map,
                    position: _myLocationLatLng,
                    icon: _self.config.locationIcon
                });

                _map.setCenter(_myLocationLatLng);
                _self.refresh(_myLocationLatLng);

            },
            function(msg){
              alert('We couldn\'t find you, so we\'ll pretend you\'re in the center of ' + _self.config.city_name);
            },
            { enableHighAccuracy: true, maximumAge: 90000 });
        }
    };

    _self.refresh = function(latLng) {
        latLng = latLng || _lastSearchLatLng || _map.getCenter();

        // Figure out the bounding box for the query
        var mapBounds = _map.getBounds();

        bbox = {
          'minx': mapBounds.getSouthWest().lng(),
          'miny': mapBounds.getSouthWest().lat(),
          'maxx': mapBounds.getNorthEast().lng(),
          'maxy': mapBounds.getNorthEast().lat()
        };

        _lastSearchLatLng = latLng;

        // "Where da art at?" she ajaxed the couch.
        $.ajax({
            url: 'data?bbox='+
                bbox.minx+','+bbox.miny+','+bbox.maxx+','+bbox.maxy,
            crossDomain: true,
            dataType: 'jsonp',
            success: function (data, textStatus, jqXHR) {
                var imgArray, i;
                _murals = data.features;

                // Normalize our images & add distances
                $.each(_murals, function(idx, mural) {
                    setImages(mural.properties);
                    if(_myLocationLatLng) {
                      mural.distance = quickDist(_myLocationLatLng.lat(), _myLocationLatLng.lng(), mural.geometry.coordinates[1], mural.geometry.coordinates[0]);
                    } else {
                      mural.distance = 0;
                    }
                });

                // Sort the murals from closest to farthest
                _murals.sort(function(a, b) { return  a.distance - b.distance; });

                // Only keep the closest 50
                //_murals = _murals.slice(0,50);
                //console.log(_murals.map(function(x){ return x.distance; }));
                // Update the map markers and the listing page
                _refreshMarkers();
                _refreshDetailList();
            }
        });
    };

    var _initMap = function() {
        _map = new google.maps.Map($(_self.config.mapTarget).get(0), _mapOptions);

        var mapType = new google.maps.StyledMapType(_mapTypeDef, { name: _mapTypeName});

        _map.mapTypes.set(_mapTypeName, mapType);
        _map.setMapTypeId(_mapTypeName);

        google.maps.event.addListener(_map, 'dragend', function() {
            _self.refresh(_map.getCenter());
        });

    };

    var _initFindMe = function() {
      $('.find-me').on('click', function(){
          _self.findMe();
      });
    };

    var _loadPages = function() {
      var $divs = $("[data-role='page']"),
      pagesObject = {};

      $divs.each(function(idx, el) {
        pagesObject[el.id] = $(el);
      });

      _pages = pagesObject;
    };

    _self.showPage = function(page_id) {
      if(!_pages) _loadPages();
      _pages[page_id].show();
    };

    _self.clearPages = function() {
      if(!_pages) _loadPages();
      _.each(_.values(_pages), function($el, idx) { $el.hide(); });
    };

    _self.RecentArtworks = new Artworks();

    _self.renderListPage = function() {
      app.showPage('list-page');
      React.render(
        <MuralList collection={_self.RecentArtworks} />,
        document.getElementById('list-page')
      );
    };

    //Init the app
    _initMap();
    _initFindMe();
    //_self.findMe();
    _loadPages();

    return _self;
  };

  m.Router = new AppRouter();

})(MuralApp);

var app;

function loadApp(callback) {
    loadConfig(function(config) {
      var backbone_couch_config = _.extend(Backbone.couch_connector.config, config.couch_connector_config);
      Backbone.couch_connector.config = backbone_couch_config;

      setupGA(config.google_analytics);
      $('#city_name').text(config.city_name);
      $('#brought_to_you_by').text(config.brought_to_you_by);

      app = app || MuralApp.App(config);

      Backbone.history.start({
        pushState: true,
        root: '/zamar/_design/viewer/_rewrite/'
      });

      if(callback) callback();
    });
}

var loadConfig = function(callback) {
  $.getJSON('config', callback);
};

// Setup the images for a given piece of art
var setImages = function (mural) {
    mural.imgs = [];
    mural.thumb = null;
    var thumbbits = [];
    if(mural.image_urls && mural.image_urls.length) {               // Using image_urls
        mural.imgs = mural.image_urls;
        // A little hack to make use of our s3-hosted thumbnails
        if(mural.image_urls[0].indexOf('publicartimages.s3') > -1) {
          thumbbits = mural.image_urls[0].split('/');
          thumbbits[thumbbits.length-1] = 'thumb_'+thumbbits[thumbbits.length-1];
          mural.thumb = thumbbits.join('/');
          thumbbits = mural.thumb.split('.');
          thumbbits[thumbbits.length-1] = thumbbits[thumbbits.length-1].toLowerCase();
          mural.thumb = thumbbits.join('.');
        }
    } else if(mural._attachments) {      // Using attachments
        imgArray = _.keys(mural._attachments);
        for(i=0; i < imgArray.length; i+=1) {
            mural.imgs.push('/dbimgs/'+mural._id+'/'+imgArray[i]);
        }
    } else {                                        // No image :(
        mural.imgs.push('images/noimage.png');
    }
    //console.log(mural.thumb);
    return mural;
};

//Go go go go go!!
$(function() {

  // This function goes through every <a> tag on the page, and for each relative
  // link it finds, it overrides the default link behavior and triggers the
  // backbone route that matches the given url.
  var takeoverLinks = function() {
    $('a').each(function(idx, el) {
      var $link = $(el),
          href = $link.attr('href');

      if(href && !href.match(/^http|^javascript/)) {
        $link.on('click', function(ev) {
          ev.preventDefault();
          MuralApp.Router.navigate(href, { trigger: true });
        });
      }
    });
  };

  loadApp(function() {
    React.render(
      <AppHeader />,
      document.getElementById('app-header')
    );

    takeoverLinks();
  });
});


