
// Define access token
mapboxgl.accessToken = 'pk.eyJ1IjoicGF1LXZpY3RvIiwiYSI6ImNta2Rib2s1bTA5d2MzZW9vaGF2a3hrczkifQ.ie1nrw6qR60q70TUdf5B_w'; //****ADD YOUR PUBLIC ACCESS TOKEN*****

// Initialize map and edit to your preference
const map = new mapboxgl.Map({
    container: 'map', // container id in HTML
    style: 'mapbox://styles/pau-victo/cmmqya137000y01s64wtr7038',  // ****ADD MAP STYLE HERE *****
    center: [-79.39, 43.71],  // starting point, longitude/latitude
    zoom: 10.5 // starting zoom level
});

map.addControl(new mapboxgl.NavigationControl(), 'top-right');

map.addControl(map.geoControls, 'top-left');

let collision;

fetch('https://raw.githubusercontent.com/PauVicto/ggr472-lab4/main/ggr472-lab4-main/data/pedcyc_collision_06-21.geojson')
    .then(response => response.json())
    .then(data => {
        collision = data;
        console.log('Collision Data loaded:', collision);


        map.on('load', () => {
            let envresult = turf.envelope(collision);

            let expanded = turf.transformScale(envresult, 1.5);

            let bbox = turf.bbox(expanded);
            console.log('bbox:', bbox);

            let hexgrid = turf.hexGrid(bbox, 0.5, { units: 'kilometers' });
            console.log('hexgrid:', hexgrid);

            let collected = turf.collect(hexgrid, collision, 'ACCNUM', 'collision_ids');

            let maxCount = 0;
            collected.features.forEach(feature => {
                feature.properties.COUNT = feature.properties.collision_ids.length;
                if (feature.properties.COUNT > maxCount) {
                    maxCount = feature.properties.COUNT;
                }
            });
            console.log("maxCount", maxCount);
            console.log(collected);

            map.addSource('collision', {
                type: 'geojson',
                data: collision
            });

            map.addLayer({
                id: 'collision-layer',
                type: 'circle',
                source: 'collision',
                paint: {
                    'circle-radius': 2,
                    'circle-color': '#FF0000',
                    'circle-opacity': 0.4
                }
            });


            map.addSource('hexgrid', {
                type: 'geojson',
                data: collected
            });

            map.addLayer({
                id: 'hexgrid-layer',
                type: 'fill',
                source: 'hexgrid',
                filter: ['>', ['get', 'COUNT'], 0],
                paint: {
                    'fill-color': [
                        'interpolate',
                        ['linear'],
                        ['get', 'COUNT'],
                        0, '#00FF00',
                        5, '#FFFF00',
                        15, '#FFA500',
                        30, '#FF4500',
                        50, '#FF0000',
                        maxCount, '#b6ffe1'
                    ],
                    'fill-opacity': 0.5,
                    'fill-outline-color': '#aca7a7'
                }
            });
        });

    });

map.on('click', 'hexgrid-layer', (e) => {
    const count = e.features[0].properties.COUNT;
    new mapboxgl.Popup()
        .setLngLat(e.lngLat)
        .setHTML(`Number of Collisions: ${count}`)
        .addTo(map);
});
map.on('mouseenter', 'hexgrid-layer', () => {
    map.getCanvas().style.cursor = 'pointer';
});
map.on('mouseleave', 'hexgrid-layer', () => {
    map.getCanvas().style.cursor = '';
});

document.getElementById('show-hexgrid').addEventListener('change', (e) => {
    map.setLayoutProperty('hexgrid-layer', 'visibility', e.target.checked ? 'visible' : 'none');
});

document.getElementById('show-collisions').addEventListener('change', (e) => {
    map.setLayoutProperty('collision-layer', 'visibility', e.target.checked ? 'visible' : 'none');
});

const legenditems = [
    { label: '1-4 Collisions', color: '#00FF00' },
    { label: '5-14 Collisions', color: '#FFFF00' },
    { label: '15-29 Collisions', color: '#FFA500' },
    { label: '30-49 Collisions', color: '#FF4500' },
    { label: '50+ Collisions', color: '#FF0000' }
];
const legend = document.querySelector('.legend');

legenditems.forEach(({ label, color }) => {
    const row = document.createElement('div');
    row.className = 'legend-row';

    const square = document.createElement('span');
    square.className = 'square';
    square.style.backgroundColor = color;

    const text = document.createElement('span');
    text.textContent = label;

    row.append(square);
    row.appendChild(text);
    legend.appendChild(row);
});

const pointRow = document.createElement('div');
pointRow.className = 'legend-row';
const dot = document.createElement('span');
dot.className = 'dot';
dot.style.backgroundColor = '#FF0000';

const pointText = document.createElement('span');
pointText.textContent = 'Collision Points';

pointRow.appendChild(dot);
pointRow.appendChild(pointText);
legend.appendChild(pointRow);