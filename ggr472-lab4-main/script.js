/* GGR472 Lab 4: Incorporating Turf.js with Mapbox GL JS */
// Define access token
mapboxgl.accessToken = 'pk.eyJ1IjoicGF1LXZpY3RvIiwiYSI6ImNta2Rib2s1bTA5d2MzZW9vaGF2a3hrczkifQ.ie1nrw6qR60q70TUdf5B_w'; //****ADD YOUR PUBLIC ACCESS TOKEN*****

// Initialize map 
const map = new mapboxgl.Map({
    container: 'map', // container id in HTML
    style: 'mapbox://styles/pau-victo/cmmqya137000y01s64wtr7038',  // custom mapstyle from mapbox
    center: [-79.39, 43.71],  // centered on Toronto
    zoom: 10.5 // starting zoom level
});

// Add zoom and rotation controls to the map.
map.addControl(new mapboxgl.NavigationControl(), 'top-right');


/* Step 2: Add in geojson Data using fetch method */

let collision; //Empty variable to store collision JSON data

//fetch the collision GeoJSON data from github
fetch('https://raw.githubusercontent.com/PauVicto/ggr472-lab4/main/ggr472-lab4-main/data/pedcyc_collision_06-21.geojson')
    .then(response => response.json())
    .then(data => {
        collision = data;
        console.log('Collision Data loaded:', collision); //check if data loaded in properly

/* Step 3: Use Turf.js to create a hexgrid and bounding box */
        map.on('load', () => {
            //Create a bounding box around all collision points
            let envresult = turf.envelope(collision);

            //Expanded bounding box slightly so hexgrid covers all points
            let expanded = turf.transformScale(envresult, 1.5);

            //Get the bounding box coordinates for the expanded envelope
            let bbox = turf.bbox(expanded);
            console.log('bbox:', bbox);

            //Create a hexgrid using bbox coordinates with 0.5 km hexagons (smaller hexagons)
            let hexgrid = turf.hexGrid(bbox, 0.5, { units: 'kilometers' });
            console.log('hexgrid:', hexgrid);

/*step 4: Aggregate collisions within hexagons using turf.collect and add count property to each hexagon*/
            let collected = turf.collect(hexgrid, collision, 'ACCNUM', 'collision_ids');

            //Create a variable to track highest collision count in hexagons
            let maxCount = 0;

            //Loop through each hexagon in collected grid and COUNT=number of collisions in that hexagon
            collected.features.forEach(feature => {
                feature.properties.COUNT = feature.properties.collision_ids.length;
                
                //Update maxCount if this hexagon has more collisions than the current max
                if (feature.properties.COUNT > maxCount) {
                    maxCount = feature.properties.COUNT;
                }
            });
            console.log("maxCount", maxCount); //log the max collision count
            console.log(collected); //log the collected hexgrid with COUNT values

/* Step 4: Finalize webmap and adding collision points and hexgrid layers for styling */
            
            //Add collision points geoJSON data source
            map.addSource('collision', {
                type: 'geojson',
                data: collision
            });

            //Add collision points as red circles
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

            //Add hexgrid with COUNT values as geoJSON source
            map.addSource('hexgrid', {
                type: 'geojson',
                data: collected
            });

            //stylized hexgrid layer with color based on COUNT property per hexagon, interpolate method
            map.addLayer({
                id: 'hexgrid-layer',
                type: 'fill',
                source: 'hexgrid',
                filter: ['>', ['get', 'COUNT'], 0],
                paint: {
                    //Interpolate color based on COUNT property, maxCOUNT is the highest number of collisions.
                    'fill-color': [
                        'interpolate',
                        ['linear'],
                        ['get', 'COUNT'],
                        0, '#00FF00',
                        5, '#FFFF00',
                        15, '#FFA500',
                        30, '#FF4500',
                        50, '#FF0000',
                        maxCount, '#741313'
                    ],
                    'fill-opacity': 0.5,
                    'fill-outline-color': '#b1abab'
                }
            });
        });

    });
/* Step 5: Add interactivity and legend */

//hexagon popup on click showing number of collisions in a specific hexagon
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

//Toggle visibility layer of hexgrid and collision points using checkboxes in HTML (event listener for each checkbox)
document.getElementById('show-hexgrid').addEventListener('change', (e) => {
    map.setLayoutProperty('hexgrid-layer', 'visibility', e.target.checked ? 'visible' : 'none');
});

document.getElementById('show-collisions').addEventListener('change', (e) => {
    map.setLayoutProperty('collision-layer', 'visibility', e.target.checked ? 'visible' : 'none');
});

//Legend: created legend items for collision count ranges shown in hexgrid
const legenditems = [
    { label: '1-4 Collisions', color: '#00FF00' },
    { label: '5-14 Collisions', color: '#FFFF00' },
    { label: '15-29 Collisions', color: '#FFA500' },
    { label: '30-49 Collisions', color: '#FF4500' },
    { label: '50+ Collisions', color: '#FF0000' },
    { label: 'Most collisions', color: '#741313' }
];

//legend container from HTML to append legend items to
const legend = document.querySelector('.legend');

//Create one legend for each item in legenditems for each count range with square and labeling
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

//Added extra legend item of collision points (red dot symbol) with same method as above
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