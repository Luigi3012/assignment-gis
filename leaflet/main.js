var self;
var polygons = [];
var shopPoints = [];
var mePoint;
var meRadius;
var radius = 5000; // meters
const myCustomColour = '#583470'

const markerHtmlStyles = `
  background-color: ${myCustomColour};
  width: 3rem;
  height: 3rem;
  display: block;
  left: -1.5rem;
  top: -1.5rem;
  position: relative;
  border-radius: 3rem 3rem 0;
  transform: rotate(45deg);
  border: 1px solid #FFFFFF`

const myIcon = L.divIcon({
  className: "my-custom-pin",
  iconAnchor: [0, 24],
  labelAnchor: [-6, 0],
  popupAnchor: [0, -36],
  html: `<span style="${markerHtmlStyles}" />`
})

function AppViewModel() {
    self = this;
    this.firstName = "Bert";
    this.lastName = "Bertington";
    self.shops = ko.observableArray([
    ]);

    self.onClick = function(place) {
        console.log("place", place)
        $.getJSON("/api/mall/" + place.name, function(data) { 
            
            var parsed = JSON.parse(data);
            //self.shops(parsed);
            clearMap();
            polygons.push(L.geoJSON(place.geojson).addTo(mymap).bindPopup(place.name));
            for(var i = 0; i< parsed.length; i++){
                //console.log("response", parsed[i]);
                shopPoints.push(L.geoJSON(parsed[i].geojson).addTo(mymap).bindPopup(parsed[i].name));               
            }
        })
    }
}

function init(){
    ko.applyBindings(new AppViewModel());
    getAllCenters();
}

var mymap = L.map('mapid').setView([48.1406311, 17.1121223], 15);
L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox.streets',
    accessToken: 'pk.eyJ1IjoibHVpZ2kzMiIsImEiOiJjam9sOWV6MGowbWEzM3dvMXFqa2w5cmc2In0.rXD4LR8aCGlHqSAIPOux1A'
}).addTo(mymap);

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    } else {
        alert("Geolocation is not supported by this browser.");
    }
}
function showPosition(position) {
    var coords = [position.coords.latitude, position.coords.longitude];
    mymap.setView(coords, 15);
    if(typeof mePoint !== 'undefined'){
        mePoint.remove();
        meRadius.remove();
    }
    var myIcon = L.divIcon({className: 'my-div-icon'});
    mePoint = L.marker(coords).addTo(mymap).bindPopup("Me.");
    meRadius = L.circle(coords, {radius: radius}).addTo(mymap);
    getNearbyCenters(position);
}

function clearMap(){
    if(typeof shopPoints !== 'undefined' && shopPoints.length > 0){
        shopPoints.forEach(function(element) {
            element.remove();
        });
    }
    if(typeof polygons !== 'undefined' && polygons.length > 0){
        polygons.forEach(function(element) {
            element.remove();
        });
    }   
    /*mymap.eachLayer(function (layer) {
        mymap.removeLayer(layer);
    });*/
}

function getAllCenters(){
    $.getJSON("/api/allshops", function(data) { 
        var parsed = JSON.parse(data);
        self.shops(parsed);
        if(typeof mePoint !== 'undefined'){
            mePoint.remove();
            meRadius.remove();
        }
        clearMap();
        for(var i = 0; i< parsed.length; i++){
            var poly = L.geoJSON(parsed[i].geojson).addTo(mymap).bindPopup(parsed[i].name);
            polygons.push(poly);
            poly.on('click', onPolyClick);
        }  
    })
}

function getParking(){
    $.getJSON("/api/parking", function(data) { 
        var parsed = JSON.parse(data);
        console.log(parsed);
        if(typeof mePoint !== 'undefined'){
            mePoint.remove();
            meRadius.remove();
        }
        clearMap();
        for(var i = 0; i< parsed.length; i++){
            console.log(parsed[i].geojson);
            var poly = L.geoJSON(parsed[i].geojson).addTo(mymap).bindPopup(parsed[i].name);
            polygons.push(poly);
            poly.on('click', onPolyClick);
        }  
    })
}

var onPolyClick = function(event){
    var label = event.target._popup._content
    console.log(event)
    var shop = self.shops().find(function(element) {
        return element.name === label;
    });
    $.getJSON("/api/mall/" + label, function(data) { 
            
        var parsed = JSON.parse(data);
        //self.shops(parsed);
        clearMap();
        polygons.push(L.geoJSON(shop.geojson).addTo(mymap).bindPopup(shop.name));
        for(var i = 0; i< parsed.length; i++){
            //console.log("response", parsed[i]);
            shopPoints.push(L.geoJSON(parsed[i].geojson).addTo(mymap).bindPopup(parsed[i].name));               
        }
    })
};

function getNearbyCenters(position){
    $.getJSON("/api/allshops/"+position.coords.latitude + "/" +position.coords.longitude + "/" + radius, function(data) { 
        var parsed = JSON.parse(data);
        self.shops(parsed);
        clearMap();
        for(var i = 0; i< parsed.length; i++){
            var poly = L.geoJSON(parsed[i].geojson).addTo(mymap).bindPopup(parsed[i].name);
            polygons.push(poly);
            poly.on('click', onPolyClick);
        }  
    })
}
