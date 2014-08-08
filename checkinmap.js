var map;
var infowindow;
var service;
var markers = [];
var pyrmont;

$(function () {
    $('.btn-fb').click(function (e) {

        authUser(function () {
            //prepareUpload('#edit-canvas', uploadDoneCallBack);
            startMap();
        }, function () {
            alert('請同意授權，才能繼續進行')
        });

    });




});

function startMap() {
    console.log('startMap');
    pyrmont = new google.maps.LatLng(25.021744, 121.498857);
    //pyrmont = new google.maps.LatLng(35.664643, 139.675731);
    
    if (navigator.geolocation) {
        console.log('geolocation:'+JSON.stringify(navigator.geolocation));
        navigator.geolocation.getCurrentPosition(showPosition,showError);
    }else{
        console.log('no-geolocation');
        initialize();
    }
    //google.maps.event.addDomListener(window, 'load', initialize);
    
}

function showError(){
    console.log('no-geolocation');
        initialize();
}

function showPosition(position) {
    console.log('showPosition');
    pyrmont = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
    initialize();
}

function initialize() {
    console.log('initialize');
    map = new google.maps.Map(document.getElementById('map-canvas'), {
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        center: pyrmont,
        styles:[{"featureType":"landscape","elementType":"labels","stylers":[{"visibility":"off"}]},{"featureType":"transit","elementType":"labels","stylers":[{"visibility":"off"}]},{"featureType":"poi","elementType":"labels","stylers":[{"visibility":"off"}]},{"featureType":"water","elementType":"labels","stylers":[{"visibility":"off"}]},{"featureType":"road","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"stylers":[{"hue":"#00aaff"},{"saturation":-100},{"gamma":2.15},{"lightness":12}]},{"featureType":"road","elementType":"labels.text.fill","stylers":[{"visibility":"on"},{"lightness":24}]},{"featureType":"road","elementType":"geometry","stylers":[{"lightness":57}]}],
        zoom: 15
    });


    infowindow = new google.maps.InfoWindow();
    service = new google.maps.places.PlacesService(map);
    
    
    //開始找附近的checkin
    var pp = map.getCenter();
    searchPlace(pp.k, pp.B, '');
    
    //這次不找商店
    //searchStore();
    /*
    google.maps.event.addListener(map, 'idle', function () {
        console.log('map change');
        searchStore();
    });
    initSearchBox();
    */

}

var _checkin_data = [];
var _total_checkin=0;
var _total_area_i = 6;
var _total_area_j = 11;
var _now_process_area = 0;
var i_latitude=0;
var i_longitude=0;
function searchPlace(latitude, longitude, _keyword) {
    i_latitude = latitude;
    i_longitude = longitude;
    console.log('searchPlace');
    for(var i=0;i<_total_area_i;i++){
        for(var j=0;j<_total_area_j;j++){
        latitude = i_latitude+0.009*i;
        longitude = i_longitude+0.009*j;
        var fql = 'SELECT page_id, name, description, checkin_count,type,latitude, longitude,distance(latitude, longitude, "' + latitude + '", "' + longitude + '") FROM place WHERE contains("' + _keyword + '") AND distance(latitude, longitude, "' + latitude + '", "' + longitude + '") < 1000 ORDER BY distance(latitude, longitude, "' + latitude + '", "' + longitude + '") LIMIT 1000';
        fql_query(fql, getPlace);
    }
    }
   // listPlace(_checkin_data);
}


function getPlace(_data) {
    console.log(_data);
    _checkin_data = _checkin_data.concat(_data)
    _now_process_area++;
    if(_now_process_area>=_total_area_i*_total_area_j){
        console.log('_checkin_data:'+_checkin_data.length);
        listPlace(_checkin_data);
        
        //$('#checkin-result').val(JSON.stringify(_checkin_data));
    }
}

function listPlace(_data) {


    if (_data.length <= 0) {

    } else {

        $.each(_data, function (index, value) {
            //$('.f-place').append('<li data-value="' + value.page_id + '"><p class="lo_name">' + value.name + '</p><p class="lo_num">' + value.checkin_count + '個打卡次</p></li>');
            //console.log('name:' + value.name + ' (' + value.checkin_count + 'checkin)');
            _total_checkin+=parseInt(value.checkin_count,10);
            if(value.checkin_count>500){
            createStoreMarker(value);
            }
        });

        console.log('_total_checkin:'+_total_checkin);


    }

}







function searchStore() {
    console.log('near search');
    var request = {
        location: map.getCenter(),
        radius: 5000,
        name: ['屈臣氏']
    };
    service.nearbySearch(request, callback);
    var pp = map.getCenter();
    //                console.log(pp);
    searchPlace(pp.k, pp.B, '');
}

function searchKey(keys) {
    console.log('key search');
    var request = {
        location: map.getCenter(),
        radius: 5000,
        query: ['屈臣氏 ' + keys]
    };
    service.textSearch(request, callback_text);
}

function callback(results, status) {
    //console.log(JSON.stringify(results));

    if (status == google.maps.places.PlacesServiceStatus.OK) {
        clearOverlays();
        for (var i = 0; i < results.length; i++) {
            createMarker(results[i]);
        }
    }


}

function callback_text(results, status) {
    var bounds = new google.maps.LatLngBounds();
    //console.log(JSON.stringify(results));

    if (status == google.maps.places.PlacesServiceStatus.OK) {
        clearOverlays();
        for (var i = 0; i < results.length; i++) {
            var place = results[i];
            bounds.extend(place.geometry.location);
            // createMarker(results[i]);

        }
    }
    map.fitBounds(bounds);
    map.setZoom(13);
    searchStore();
}
/*
var marker = new google.maps.Marker({
    position: map.getCenter(),
    icon: {
      path: google.maps.SymbolPath.CIRCLE,
      scale: 10
    },
    draggable: true,
    map: map
  });*/


function createStoreMarker(value) {
    //console.log(JSON.stringify(place));
    
    var pp = new google.maps.LatLng(parseFloat(value.latitude), parseFloat(value.longitude));
    //console.log(JSON.stringify(value));
    var ss = parseInt(Math.sqrt(value.checkin_count) / 40);
    //console.log(ss);
    if(ss>10){
        ss=10;
    }
    if(ss<1){
        ss=1;
    }
    var icolor = ['#000','#000','#200','#300','#500','#600','#700','#800','#a00','#d00','#f00'];
    var marker = new google.maps.Marker({
        map: map,
        position: pp,
        icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: ss,
            strokeWeight:0,
            fillOpacity :.8,
            fillColor:icolor[ss]
        }
    });

    markers.push(marker);
     google.maps.event.addListener(marker, 'click', function() {
                    infowindow.setContent(value.name+"\n" + value.checkin_count);
                    infowindow.open(map, this);
                });
    /*
                google.maps.event.addListener(marker, 'click', function() {
                    infowindow.setContent(place.name + "\n" + place.vicinity);
                    infowindow.open(map, this);
                });
                */
}

function createMarker(place) {
    console.log(JSON.stringify(place));
    var placeLoc = place.geometry.location;
    var marker = new google.maps.Marker({
        map: map,
        position: place.geometry.location
    });

    markers.push(marker);

    google.maps.event.addListener(marker, 'click', function () {
        infowindow.setContent(place.name + "\n" + place.vicinity);
        infowindow.open(map, this);
    });
}

function clearOverlays() {
    for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(null);
    }
    markers = [];
}

function initSearchBox() {
    var input = document.getElementById('target');
    var options = {
        types: ['geocode'],
        componentRestrictions: {
            country: 'tw'
        }
    };

    var searchBox = autocomplete = new google.maps.places.Autocomplete(input, options);
    google.maps.event.addListener(autocomplete, 'place_changed', function () {
        var place = autocomplete.getPlace();
        console.log(place.name);
        searchKey(place.name);
    });
    /*
                var searchBox = new google.maps.places.SearchBox(input);

                google.maps.event.addListener(searchBox, 'places_changed', function() {
                    var places = searchBox.getPlaces();

                    
                  
                    
                    markers = [];
                    var bounds = new google.maps.LatLngBounds();
                    for (var i = 0, place; place = places[i]; i++) {
                        var image = {
                            url: place.icon,
                            size: new google.maps.Size(71, 71),
                            origin: new google.maps.Point(0, 0),
                            anchor: new google.maps.Point(17, 34),
                            scaledSize: new google.maps.Size(25, 25)
                        };

                        
                        var marker = new google.maps.Marker({
                            map: map,
                            icon: image,
                            title: place.name,
                            position: place.geometry.location
                        });

                       

                        bounds.extend(place.geometry.location);
                    }

                    map.fitBounds(bounds);
                });
                */
}

/*
            function initSearchBox() {
                var input = document.getElementById('target');
                var searchBox = new google.maps.places.SearchBox(input);

                google.maps.event.addListener(searchBox, 'places_changed', function() {
                    var places = searchBox.getPlaces();

                    
                  
                    
                    markers = [];
                    var bounds = new google.maps.LatLngBounds();
                    for (var i = 0, place; place = places[i]; i++) {
                        var image = {
                            url: place.icon,
                            size: new google.maps.Size(71, 71),
                            origin: new google.maps.Point(0, 0),
                            anchor: new google.maps.Point(17, 34),
                            scaledSize: new google.maps.Size(25, 25)
                        };

                        
                        var marker = new google.maps.Marker({
                            map: map,
                            icon: image,
                            title: place.name,
                            position: place.geometry.location
                        });

                       

                        bounds.extend(place.geometry.location);
                    }

                    map.fitBounds(bounds);
                });
            }
*/