// ==========================================
// 1. MAP INITIALIZATION & LAYERS
// ==========================================
var osmStandard = L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', { maxZoom: 20 });
var satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { maxZoom: 19, attribution: 'Tiles © Esri' });
var darkMode = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { maxZoom: 19, attribution: '© CartoDB' });
var map = L.map('map').setView([22.6500, 85.9500], 10);
L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png').addTo(map);

L.control.layers({
    "Standard Map": osmStandard,
    "Satellite View": satellite,
    "Dark Mode": darkMode
}).addTo(map);

var userCurrentLatLng = null;

// ==========================================
// 2. ROUTING ENGINE (Street Navigation)
// ==========================================
var routingControl = L.Routing.control({
    waypoints: [],
    routeWhileDragging: false, 
    show: false, 
    addWaypoints: false,
    showAlternatives: true,
    altLineOptions: { styles: [{color: 'black', opacity: 0.15, weight: 9}, {color: 'white', opacity: 0.8, weight: 6}, {color: '#bdc3c7', opacity: 0.8, weight: 3}] },
    lineOptions: { styles: [{ color: '#ffffff', opacity: 0.9, weight: 10 }, { color: '#1a73e8', opacity: 1, weight: 5 }] }
}).addTo(map);

window.navigateTo = function(destLat, destLng) {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            function(position) {
                routingControl.setWaypoints([ L.latLng(position.coords.latitude, position.coords.longitude), L.latLng(destLat, destLng) ]);
                map.closePopup(); 
            }, 
            function() { alert("Please allow location access."); }
        );
    } else { alert("Geolocation is not supported."); }
};

// ==========================================
// 3. COMPLETE LOCATIONS DATABASE
// ==========================================
const chaibasaPlaces = [
    // Chaibasa Area
    { name: "Chaibasa Clock Tower", category: "Landmark", lat: 22.5533, lng: 85.8058, symbol: "🕰️", description: "Bustling commercial hub." },
    { name: "Jubilee Lake Park", category: "Park", lat: 22.5580, lng: 85.8120, symbol: "🏞️", description: "Serene park centered around a beautiful local lake." },
    { name: "Kachahari Talab Park", category: "Park", lat: 22.5500, lng: 85.8200, symbol: "🌳", description: "Well-maintained community space." },
    { name: "Chaibasa Engineering College", category: "College", lat: 22.5180, lng: 85.8080, symbol: "🎓", description: "Engineering institute." },
    { name: "Roro Dam", category: "Attraction", lat: 22.5350, lng: 85.8010, symbol: "🌊", description: "Tranquil water reservoir." },
    
    // Jamshedpur Area
    { name: "Seraikela Town", category: "Town", lat: 22.6975, lng: 85.9288, symbol: "🏘️", description: "Historic town and district headquarters." },
    { name: "Adityapur Toll Bridge", category: "Landmark", lat: 22.7845, lng: 86.1654, symbol: "🌉", description: "Gateway to Jamshedpur crossing the Kharkai River." },
    { name: "NIT Jamshedpur", category: "College", lat: 22.7766, lng: 86.1438, symbol: "🎓", description: "National Institute of Technology in Adityapur." },
    { name: "Bistupur Market", category: "Market", lat: 22.7963, lng: 86.1837, symbol: "🛍️", description: "Prime commercial area." },
    { name: "Jubilee Park, JSR", category: "Park", lat: 22.8055, lng: 86.1832, symbol: "🌳", description: "Massive urban park." },
    { name: "Dalma Sanctuary", category: "Attraction", lat: 22.8833, lng: 86.2167, symbol: "🐘", description: "Forested area famous for wild elephants." },
    
    // Kolkata & Howrah Attractions
    { name: "Victoria Memorial", category: "Landmark", lat: 22.5448, lng: 88.3426, symbol: "🏛️", description: "Iconic marble building." },
    { name: "Howrah Bridge", category: "Landmark", lat: 22.5851, lng: 88.3468, symbol: "🌉", description: "Historic cantilever bridge." },
    { name: "Eco Park", category: "Park", lat: 22.6163, lng: 88.4665, symbol: "🌳", description: "Massive urban park in New Town." },
    { name: "Dakshineswar Kali Temple", category: "Temple", lat: 22.6534, lng: 88.3577, symbol: "🛕", description: "Famous Hindu temple." },

    // Railway Stations
    { name: "Howrah Railway Station", category: "Train Station", lat: 22.5830, lng: 88.3425, symbol: "🚉", description: "Terminal Station." },
    { name: "Santragachi Junction", category: "Train Station", lat: 22.5802, lng: 88.2774, symbol: "🚉", description: "Major junction in Howrah." },
    { name: "Panskura Junction", category: "Train Station", lat: 22.3892, lng: 87.7121, symbol: "🚉", description: "Busy suburban/regional station." },
    { name: "Kharagpur Railway Station", category: "Train Station", lat: 22.3330, lng: 87.3250, symbol: "🚉", description: "Major railway junction." },
    { name: "Jhargram Station", category: "Train Station", lat: 22.4540, lng: 86.9930, symbol: "🚉", description: "Important stop before entering Jharkhand." },
    { name: "Ghatsila Station", category: "Train Station", lat: 22.5830, lng: 86.4780, symbol: "🚉", description: "Tourist destination station." },
    { name: "Rakha Mines Station", category: "Train Station", lat: 22.6375, lng: 86.3785, symbol: "🚉", description: "Station near the copper mining area." },
    { name: "Tatanagar Junction", category: "Train Station", lat: 22.7667, lng: 86.1985, symbol: "🚉", description: "Major junction serving Jamshedpur." },
    { name: "Adityapur Station", category: "Train Station", lat: 22.7850, lng: 86.1550, symbol: "🚉", description: "Industrial hub station." },
    { name: "Sini Junction", category: "Train Station", lat: 22.7950, lng: 85.9550, symbol: "🚉", description: "Railway junction." },
    { name: "Rajkharsawan Junction", category: "Train Station", lat: 22.7500, lng: 85.8200, symbol: "🚉", description: "Junction where lines split to Chaibasa & Chakradharpur." },
    { name: "Chaibasa Railway Station", category: "Train Station", lat: 22.5650, lng: 85.8150, symbol: "🚉", description: "Station serving West Singhbhum headquarters." },
    { name: "Chakradharpur Railway Station", category: "Train Station", lat: 22.6784, lng: 85.6263, symbol: "🚉", description: "Headquarters of the Chakradharpur railway division." },

    // Metro & Ferry
    { name: "Howrah Metro Station", category: "Metro", lat: 22.5848, lng: 88.3434, symbol: "🚇", description: "Deepest metro station in India." },
    { name: "Howrah Ferry Ghat", category: "Ferry", lat: 22.5835, lng: 88.3441, symbol: "⛴️", description: "Major ferry terminal." }
];

// ==========================================
// 4. PLOT MARKERS
// ==========================================
var markerObjects = []; 
chaibasaPlaces.forEach(place => {
    let customEmojiIcon = L.divIcon({ 
        html: `<div class="dark-icon-bg" style="font-size:18px; text-align:center; background:white; border-radius:50%; box-shadow:0 2px 5px rgba(0,0,0,0.3); width:30px; height:30px; display:flex; align-items:center; justify-content:center;">${place.symbol}</div>`, 
        className: 'custom-icon', iconSize: [30, 30], iconAnchor: [15, 15], popupAnchor: [0, -15]    
    });

    let marker = L.marker([place.lat, place.lng], { icon: customEmojiIcon }).addTo(map);
    marker.bindTooltip(`<div style="text-align:center; font-weight:bold;">${place.name}</div>`, { permanent: true, direction: 'bottom', className: 'custom-map-label', offset: [0, 10] });

    marker.bindPopup(`
        <div style="font-family:sans-serif; min-width:160px;">
            <h3 style="margin:0; color:#1a73e8; font-size:16px;">${place.name}</h3>
            <span style="display:inline-block; margin-top:6px; padding:2px 6px; background:#eee; border-radius:4px; font-size:11px; font-weight:bold;">${place.category}</span>
            <p style="margin-top:8px; font-size:12px; color:#333;">${place.description}</p>
            <button onclick="navigateTo(${place.lat}, ${place.lng})" style="margin-top:8px; width:100%; background:#2980b9; color:white; border:none; padding:8px; border-radius:4px; cursor:pointer; font-weight:bold;">📍 Navigate Here</button>
        </div>
    `);
    markerObjects.push({ name: place.name, marker: marker, lat: place.lat, lng: place.lng, category: place.category });
});

// ==========================================
// 5. SEARCH & 6. GEOLOCATION
// ==========================================
window.searchPlace = function() {
    let input = document.getElementById('searchBox').value.toLowerCase().trim();
    if (input === "") return;
    let found = markerObjects.find(loc => loc.name.toLowerCase().includes(input));
    if (found) { map.flyTo([found.lat, found.lng], 15, { animate: true, duration: 1.5 }); setTimeout(() => { found.marker.openPopup(); }, 1500); } 
    else { alert("Location not found!"); }
}

L.Control.LocateMe = L.Control.extend({
    onAdd: function(map) {
        var btn = L.DomUtil.create('button', 'locate-btn');
        btn.innerHTML = '<span>🎯</span><span>Locate Me</span>';
        btn.onclick = function(e) { e.preventDefault(); map.locate({setView: true, maxZoom: 16}); }
        return btn;
    }
});
L.control.locateMe = function(opts) { return new L.Control.LocateMe(opts); }
L.control.locateMe({ position: 'topleft' }).addTo(map);

// ==========================================
// 7. RAILWAY NETWORK DRAWING (TWO COLORS & LABELS)
// ==========================================
// ==========================================
const railwayLines = [
    {
        name: "South Eastern Main Line",
        color: "#2c3e50", // Dark Blue/Grey
        track: [
            [22.5830, 88.3425], [22.5802, 88.2774], [22.3892, 87.7121], [22.3330, 87.3250], 
            [22.4540, 86.9930], [22.5830, 86.4780], [22.6375, 86.3785], [22.7667, 86.1985], 
            [22.7850, 86.1550], [22.7950, 85.9550], [22.7500, 85.8200], [22.6784, 85.6263]
        ]
    },
    {
        name: "Chaibasa Branch Line",
        color: "#8e44ad", // Purple
        track: [ [22.7500, 85.8200], [22.5650, 85.8150] ]
    }
];

railwayLines.forEach(line => {
    // 1. Draw the primary colored line
    L.polyline(line.track, { 
        color: line.color, 
        weight: 6, 
        opacity: 0.9,
        className: 'railway-line' 
    }).addTo(map).bindTooltip(`<b>${line.name}</b>`, { sticky: true });
    
    // 2. Draw the white dashed detail on top
    L.polyline(line.track, { 
        color: '#ffffff', 
        weight: 3, 
        dashArray: '6, 8', 
        opacity: 0.7, 
        interactive: false 
    }).addTo(map);
});

railwayLines.forEach(line => {
    // Draw the colored base line
    let baseLine = L.polyline(line.track, { color: line.color, weight: 6, opacity: 0.9 }).addTo(map);
    // Draw the white dashes on top to look like a track
    L.polyline(line.track, { color: '#ffffff', weight: 4, dashArray: '6, 8', opacity: 0.8, interactive: false }).addTo(map);
    
    // Add hover tooltip to signify the track
    baseLine.bindTooltip(`<b>${line.name}</b>`, { sticky: true, className: 'custom-map-label' });
});

// ==========================================
// 8. DYNAMIC TRAIN ROUTING LOGIC
// ==========================================
const trainLinePath = [
    [22.5830, 88.3425], [22.5802, 88.2774], [22.3892, 87.7121], [22.3330, 87.3250], 
    [22.4540, 86.9930], [22.5830, 86.4780], [22.6375, 86.3785], [22.7667, 86.1985], 
    [22.7850, 86.1550], [22.7950, 85.9550], [22.7500, 85.8200], [22.5650, 85.8150]  
];

function getNearestStation(lat, lng) {
    let stations = chaibasaPlaces.filter(p => p.category === "Train Station");
    let nearest = null, minDistance = Infinity;
    stations.forEach(station => {
        let dist = L.latLng(lat, lng).distanceTo(L.latLng(station.lat, station.lng)) / 1000;
        if (dist < minDistance) { minDistance = dist; nearest = station; }
    });
    return minDistance <= 40 ? { station: nearest, distance: minDistance } : null; 
}

function getTrainPathSegment(startLat, startLng, endLat, endLng) {
    let startIndex = 0, minStartDist = Infinity, endIndex = 0, minEndDist = Infinity;
    
    trainLinePath.forEach((pt, idx) => {
        let dStart = L.latLng(startLat, startLng).distanceTo(L.latLng(pt[0], pt[1]));
        let dEnd = L.latLng(endLat, endLng).distanceTo(L.latLng(pt[0], pt[1]));
        if(dStart < minStartDist) { minStartDist = dStart; startIndex = idx; }
        if(dEnd < minEndDist) { minEndDist = dEnd; endIndex = idx; }
    });
    
    let path = (startIndex <= endIndex) ? trainLinePath.slice(startIndex, endIndex + 1) : trainLinePath.slice(endIndex, startIndex + 1).reverse();
    if (startLat === 22.6784 || endLat === 22.6784) path.push([22.6784, 85.6263]);
    path.unshift([startLat, startLng]); path.push([endLat, endLng]);
    return path;
}

// ==========================================
// 9. TRIP PLANNER & CORNER TURN-BY-TURN
// ==========================================
L.Control.TripPlanner = L.Control.extend({
    onAdd: function(map) {
        var div = L.DomUtil.create('div', 'ui-panel');
        div.style.background = "white"; div.style.padding = "15px"; div.style.borderRadius = "8px"; div.style.boxShadow = "0 4px 15px rgba(0,0,0,0.2)"; div.style.width = "280px";
        div.innerHTML = `
            <h3 style="margin: 0 0 10px 0; color: #1a73e8; font-size: 15px;">📍 Multi-Modal Trip Planner</h3>
            <input list="placesList" id="fromInput" placeholder="Start location..." style="width: 100%; padding: 6px; margin-bottom: 8px; box-sizing: border-box;">
            <input list="placesList" id="toInput" placeholder="Destination..." style="width: 100%; padding: 6px; margin-bottom: 12px; box-sizing: border-box;">
            <datalist id="placesList"></datalist>
            <button onclick="calculateTrip()" style="width: 100%; background: #1a73e8; color: white; border: none; padding: 8px; border-radius: 4px; cursor: pointer; font-weight: bold;">Calculate Route</button>
            <div id="tripResult" style="margin-top: 15px; font-size: 12px;"></div>
        `;
        L.DomEvent.disableClickPropagation(div); L.DomEvent.disableScrollPropagation(div);
        return div;
    }
});
L.control.tripPlanner = function(opts) { return new L.Control.TripPlanner(opts); }
L.control.tripPlanner({ position: 'topright' }).addTo(map);

L.Control.TurnByTurnPanel = L.Control.extend({
    onAdd: function(map) {
        var div = L.DomUtil.create('div', 'ui-panel turn-by-turn-panel'); 
        div.id = "turnByTurnUI"; div.style.display = "none"; div.style.background = "white"; div.style.padding = "12px"; div.style.borderRadius = "8px"; div.style.boxShadow = "0 4px 15px rgba(0,0,0,0.2)"; div.style.width = "250px"; div.style.maxHeight = "250px"; div.style.overflowY = "auto";
        L.DomEvent.disableClickPropagation(div); L.DomEvent.disableScrollPropagation(div);
        return div;
    }
});
L.control.turnByTurnPanel = function(opts) { return new L.Control.TurnByTurnPanel(opts); }
L.control.turnByTurnPanel({ position: 'bottomleft' }).addTo(map); 

routingControl.on('routesfound', function(e) {
    var uiBox = document.getElementById("turnByTurnUI");
    if (e.routes[0].instructions.length > 0 && !isTrainViewActive) {
        uiBox.style.display = "block";
        var html = `<h3 style="margin:0 0 10px 0; color:#1a73e8; font-size:13px; border-bottom: 1px solid #eee; padding-bottom: 5px;">🗺️ Street Navigation</h3><ul style="padding: 0; list-style: none; margin: 0; font-size: 11px; color: #333;">`;
        e.routes[0].instructions.forEach((step, idx) => {
            let dist = step.distance > 1000 ? (step.distance/1000).toFixed(1) + 'km' : Math.round(step.distance) + 'm';
            html += `<li style="margin-bottom: 8px; border-bottom: 1px solid #fafafa; padding-bottom: 4px;"><b>${idx+1}.</b> ${step.text} <span style="float: right; color:#e67e22; font-weight: bold;">${dist}</span></li>`;
        });
        uiBox.innerHTML = html + `</ul>`;
    }
});

setTimeout(() => {
    const datalist = document.getElementById('placesList');
    if(datalist) { chaibasaPlaces.forEach(p => { let opt = document.createElement('option'); opt.value = p.name; datalist.appendChild(opt); }); }
}, 500);

// ==========================================
// 10. DYNAMIC CALCULATE ROUTE LOGIC
// ==========================================
var isTrainViewActive = false;
var activeTrainSegment = null;
var firstMileLine = null;
var lastMileLine = null;

window.toggleDynamicTrainSchedule = function(sLat, sLng, eLat, eLng, startLat, startLng, endLat, endLng) {
    const ts = document.getElementById('dynamicTrainSchedule');
    const tbt = document.getElementById('turnByTurnUI');
    
    if (!isTrainViewActive) {
        isTrainViewActive = true;
        if(ts) ts.style.display = 'block';
        if(tbt) tbt.style.display = 'none';

        routingControl.setWaypoints([]); 
        
        let segmentCoords = getTrainPathSegment(sLat, sLng, eLat, eLng);
        activeTrainSegment = L.polyline(segmentCoords, { color: '#e74c3c', weight: 8, opacity: 0.9, lineCap: 'round' }).addTo(map);
        firstMileLine = L.polyline([[startLat, startLng], [sLat, sLng]], { color: '#34495e', weight: 4, dashArray: '8, 8' }).addTo(map);
        lastMileLine = L.polyline([[eLat, eLng], [endLat, endLng]], { color: '#34495e', weight: 4, dashArray: '8, 8' }).addTo(map);
        map.fitBounds(activeTrainSegment.getBounds(), { padding: [50, 50] });

    } else {
        isTrainViewActive = false;
        if(ts) ts.style.display = 'none';
        if(tbt) tbt.style.display = 'block'; 

        if(activeTrainSegment) map.removeLayer(activeTrainSegment);
        if(firstMileLine) map.removeLayer(firstMileLine);
        if(lastMileLine) map.removeLayer(lastMileLine);
        routingControl.setWaypoints([L.latLng(startLat, startLng), L.latLng(endLat, endLng)]);
    }
};

window.calculateTrip = function() {
    const fromName = document.getElementById("fromInput").value;
    const toName = document.getElementById("toInput").value;
    const startPlace = chaibasaPlaces.find(p => p.name === fromName);
    const endPlace = chaibasaPlaces.find(p => p.name === toName);

    if (!startPlace || !endPlace) { alert("Please select valid locations."); return; }

    if (isTrainViewActive) {
        isTrainViewActive = false;
        if(activeTrainSegment) map.removeLayer(activeTrainSegment);
        if(firstMileLine) map.removeLayer(firstMileLine);
        if(lastMileLine) map.removeLayer(lastMileLine);
    }

    const startLatLng = L.latLng(startPlace.lat, startPlace.lng);
    const endLatLng = L.latLng(endPlace.lat, endPlace.lng);
    const totalDist = startLatLng.distanceTo(endLatLng) / 1000;

    routingControl.setWaypoints([startLatLng, endLatLng]);

    let optionsHtml = "";
    const buildCard = (title, icon, color, details, extraHTML = "") => `
        <div style="border-left: 4px solid ${color}; padding: 6px; background: white; margin-bottom: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border-radius: 0 4px 4px 0;">
            <b style="color: ${color};">${icon} ${title}</b><br><span style="font-size: 11px; color: #333;">${details}</span>
        </div>${extraHTML}`;

    let trainCardHtml = "";
    if (totalDist > 20) {
        let nearestStart = getNearestStation(startPlace.lat, startPlace.lng);
        let nearestEnd = getNearestStation(endPlace.lat, endPlace.lng);

        if (nearestStart && nearestEnd && nearestStart.station.name !== nearestEnd.station.name) {
            let sStation = nearestStart.station;
            let eStation = nearestEnd.station;
            
            let manualChart = `
                <div id="dynamicTrainSchedule" style="display: none; margin-top: 5px; padding: 10px; background: white; border: 1px solid #dcdde1; border-radius: 4px;">
                    <h4 style="margin: 0 0 8px 0; font-size: 12px; color: #c0392b; border-bottom: 1px solid #eee; padding-bottom: 4px;">🚆 ${sStation.name} ➡ ${eStation.name}</h4>
                    <p style="font-size: 10px; color: #e67e22; margin: 0 0 8px 0;"><b>Map Updated: Red Line indicates Train Journey.</b></p>
                    <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 10px;">
                        <thead><tr style="border-bottom: 1px solid #ccc; color: #444;"><th>Train</th><th>Dep</th><th>Arr</th></tr></thead>
                        <tbody>
                            <tr style="border-bottom: 1px dashed #eee;"><td style="padding:4px 0;"><b>Morning Exp</b></td><td style="color:#2980b9;">08:30 AM</td><td style="color:#27ae60;">TBD</td></tr>
                            <tr style="border-bottom: 1px dashed #eee;"><td style="padding:4px 0;"><b>Intercity Fast</b></td><td style="color:#2980b9;">12:15 PM</td><td style="color:#27ae60;">TBD</td></tr>
                        </tbody>
                    </table>
                </div>
            `;

            trainCardHtml = `
                <div style="cursor: pointer; border-left: 4px solid #c0392b; padding: 6px; background: white; margin-bottom: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border-radius: 0 4px 4px 0;" onclick="toggleDynamicTrainSchedule(${sStation.lat}, ${sStation.lng}, ${eStation.lat}, ${eStation.lng}, ${startPlace.lat}, ${startPlace.lng}, ${endPlace.lat}, ${endPlace.lng})">
                    <b style="color: #c0392b;">🚆 Train Route <span style="font-size:10px; color:#888;">(Click to View Route & Chart)</span></b><br>
                    <span style="font-size: 10px; color: #555;">1. Transit to ${sStation.name}<br>2. Train to ${eStation.name}<br>3. Transit to destination</span>
                </div>
                ${manualChart}
            `;
        }
    }

    const isKolkataTrip = (startPlace.lng > 88.0 && endPlace.lng > 88.0);

    if (totalDist < 3) {
        optionsHtml += buildCard("Walk (via Local Streets)", "🚶", "#27ae60", `Time: ~${Math.round(totalDist * 12)} mins | Fare: <b>Free</b>`);
        optionsHtml += buildCard("Toto / E-Rickshaw", "🛺", "#f39c12", `Time: ~${Math.round(totalDist * 5)} mins | Fare: <b>₹${Math.max(10, Math.round(totalDist * 15))}</b>`);
    } else if (isKolkataTrip) {
        optionsHtml += buildCard("Kolkata Metro", "🚇", "#2980b9", "Route to nearest Metro Station.<br>Fare: <b>₹10 - ₹30</b>");
        if (fromName.includes("Ghat") || toName.includes("Ghat") || fromName.includes("Howrah") || toName.includes("Howrah")) {
            optionsHtml += buildCard("Hooghly River Ferry", "⛴️", "#16a085", "Scenic boat ride avoiding bridge traffic.<br>Fare: <b>₹10 - ₹20</b>");
        }
        optionsHtml += buildCard("Yellow Taxi / App Cab", "🚕", "#f1c40f", `Time: ~${Math.round(totalDist * 3)} mins | Fare: <b>₹${Math.round(totalDist * 25)}</b>`);
    } else if (totalDist >= 3 && totalDist <= 20) {
        optionsHtml += buildCard("Auto (Reserved)", "🛺", "#e67e22", `Time: ~${Math.round(totalDist * 3)} mins | Fare: <b>₹${Math.max(40, Math.round(totalDist * 20))}</b>`);
        optionsHtml += buildCard("Cab / Taxi", "🚕", "#3498db", `Time: ~${Math.round(totalDist * 2.5)} mins | Fare: <b>₹${Math.max(80, Math.round(totalDist * 35))}</b>`);
    } else {
        if (trainCardHtml !== "") optionsHtml += trainCardHtml; 
        optionsHtml += buildCard("Inter-city Bus", "🚌", "#8e44ad", `Direct from Bus Terminal.<br>Time: ~${(totalDist/30).toFixed(1)} hrs | Fare: <b>₹${Math.round(totalDist * 1.5)}</b>`);
        optionsHtml += buildCard("Direct Highway Cab", "🚕", "#3498db", `Door-to-door through highways.<br>Time: ~${(totalDist/45).toFixed(1)} hrs | Fare: <b>₹${Math.round(totalDist * 30)}</b>`);
    }

    document.getElementById("tripResult").innerHTML = `
        <div style="background: #f4f6f8; padding: 10px; border-radius: 6px; border: 1px solid #dcdde1; max-height: 250px; overflow-y: auto;">
            <div style="border-bottom: 1px solid #ccc; padding-bottom: 5px; margin-bottom: 5px; font-size: 13px;">
                <b>Total Travel Distance:</b> <span style="color: #e67e22; font-weight: bold;">${totalDist.toFixed(1)} km</span>
            </div>
            <b style="font-size: 12px; color: #2c3e50;">Suggested Modes:</b><br>
            ${optionsHtml}
        </div>
    `;
};

// ==========================================
// 11. MAP LEGEND (SIGNIFY TRACKS)
// ==========================================
L.Control.Legend = L.Control.extend({
    onAdd: function(map) {
        var div = L.DomUtil.create('div', 'ui-panel');
        div.style.background = "white"; div.style.padding = "10px"; div.style.borderRadius = "8px"; div.style.boxShadow = "0 4px 15px rgba(0,0,0,0.2)"; div.style.width = "180px";
        div.innerHTML = `
            <h4 style="margin:0 0 5px 0; font-size:12px; color:#333; border-bottom: 1px solid #eee; padding-bottom: 4px;">🗺️ Route Legend</h4>
            <div style="font-size:11px; line-height:1.8; color: #555;">
                <div><span style="display:inline-block; width:20px; border-bottom: 4px solid #1a73e8; margin-right:6px; vertical-align:middle;"></span> Road Route</div>
                <div><span style="display:inline-block; width:20px; border-bottom: 4px solid #e74c3c; margin-right:6px; vertical-align:middle;"></span> Active Train Route</div>
                <div><span style="display:inline-block; width:20px; border-bottom: 3px dashed #2c3e50; margin-right:6px; vertical-align:middle;"></span> S.E. Main Line</div>
                <div><span style="display:inline-block; width:20px; border-bottom: 3px dashed #8e44ad; margin-right:6px; vertical-align:middle;"></span> Chaibasa Branch</div>
            </div>
        `;
        // Prevent accidental map movement when clicking legend
        L.DomEvent.disableClickPropagation(div); L.DomEvent.disableScrollPropagation(div);
        return div;
    }
});
L.control.legend = function(opts) { return new L.Control.Legend(opts); }
L.control.legend({ position: 'bottomright' }).addTo(map);