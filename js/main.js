let pos;
let map;
let bounds;
let infoWindow;
let currentInfoWindow;
let service;
let infoPane;

function initMap(){

    bounds = new google.maps.LatLngBounds();
    infoWindow = new google.maps.InfoWindow;
    currentInfoWindow = infoWindow;
    /* TODO add a sidebar */
    infoPane = document.getElementById('panel');

    // html5 geolocation
    if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition(position =>{
            pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            map = new google.maps.Map(document.getElementById('map'),{
                center: pos,
                zoom: 15});
        bounds.extend(pos);

        infoWindow.setPosition(pos);
        infoWindow.setContent('YOUR HERE');
        infoWindow.open(map);
        map.setCenter(pos);

        getNearbyPlaces(pos);
        }, () => {
            handleLocationError(true, infoWindow);
        });
    }else{
        handleLocationError(false, infoWindow);
    }
    
}

// Handle a geolocation error
function handleLocationError(browserHasGeolocation,infoWindow){
    pos = {lat: -33.856,lng: 151.215};
    map = new google.maps.Map(document.getElementById('map'),{
    center: pos,
    zoom: 15
    });

    infoWindow.setPosition(pos);
    infoWindow.setContent(browserHasGeolocation ? 
        'Geolocation permissions denied. Using default location.' :
        'Error: Your browser doesn\'t support geolocation.');
        infoWindow.open(map);
        currentInfoWindow = infoWindow;

    getNearbyPlaces(pos);
}

function getNearbyPlaces(position){
    let request = {
        location: position,
        rankBy: google.maps.places.RankBy.DISTANCE,
        keyword: 'curry'
    };

    service = new google.maps.places.PlacesService(map);
    service.nearbySearch(request,nearbyCallback);
}

function nearbyCallback(results, status){
    if(status == google.maps.places.PlacesServiceStatus.OK) {
        createMarkers(results);
    }
}

function createMarkers(places){
    places.forEach(place => {
        let marker = new google.maps.Marker({
            position: place.geometry.location,
            map: map,
            title: place.name
        });

        /* TODO step4B*/
        google.maps.event.addListener(marker,'click', () => {
            let request = {
                placeId: place.place_id,
                fields: ['name','formatted_address','geometry','rating','website','photos']
            };
            service.getDetails(request,(placeResult, status) => {
                showDetails(placeResult, marker, status);
            });
        });
        bounds.extend(place.geometry.location);
    });

    map.fitBounds(bounds);
}
    /* TODO step4c*/
    function showDetails(placeResult, marker, status){
        if(status == google.maps.places.PlacesServiceStatus.OK){
            let placeInfoWindow = new google.maps.InfoWindow();
            let rating = "None";
            if(placeResult.rating) rating = placeResult.rating;
            placeInfoWindow.setContent('<div><strong>' + placeResult.name + '</strong><br>' + 'Rating: ' + placeResult.rating + '</div>');
            placeInfoWindow.open(marker.map, marker);
            currentInfoWindow.close();
            currentInfoWindow = placeInfoWindow;
            showPanel(placeResult);
        }else{
            console.log('showDetails faild: ' + status);
        }
    }
    /* TODO step4d */
    function showPanel(placeResult){
        if(infoPane.classList.contains("open")){
            infoPane.classList.remove("open");
        }

        while(infoPane.lastChild){
            infoPane.removeChild(infoPane.lastChild);
        }

        if(placeResult.photos){
            let firstPhoto = placeResult.photos[0];
            let photo = document.createElement('img');
            photo.classList.add('hero');
            photo.src = firstPhoto.getUrl();
            infoPane.appendChild(photo);
        }

        let name = document.createElement('h1');
        name.classList.add('place');
        name.textContent = placeResult.name;
        infoPane.appendChild(name);
        if(placeResult.rating){
            let rating = document.createElement('p');
            rating.classList.add('details');
            rating.textContent = `Rating ${placeResult.rating} \u272e`;
            infoPane.appendChild(rating);
        }

        let address = document.createElement('p');
        address.classList.add('details');
        address.textContent = placeResult.formatted_address;
        infoPane.appendChild(address);
        if(placeResult.website){
            let websitePara = document.createElement('p');
            let websiteLink = document.createElement('a');
            let websiteUrl = document.createTextNode(placeResult.website);
            websiteLink.appendChild(websiteUrl);
            websiteLink.title = placeResult.website;
            websiteLink.href = placeResult.website;
            websitePara.appendChild(websiteLink);
            infoPane.appendChild(websitePara);
        }
        infoPane.classList.add("open");
    }
