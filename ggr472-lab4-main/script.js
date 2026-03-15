/*--------------------------------------------------------------------
GGR472 LAB 4: Incorporating GIS Analysis into web maps using Turf.js 
--------------------------------------------------------------------*/

/*--------------------------------------------------------------------
Step 1: INITIALIZE MAP
--------------------------------------------------------------------*/
// Define access token
mapboxgl.accessToken = 'pk.eyJ1IjoicGF1LXZpY3RvIiwiYSI6ImNta2Rib2s1bTA5d2MzZW9vaGF2a3hrczkifQ.ie1nrw6qR60q70TUdf5B_w'; //****ADD YOUR PUBLIC ACCESS TOKEN*****

// Initialize map and edit to your preference
const map = new mapboxgl.Map({
    container: 'map', // container id in HTML
    style: 'mapbox://styles/pau-victo/cmmqya137000y01s64wtr7038',  // ****ADD MAP STYLE HERE *****
    center: [-79.39, 43.65],  // starting point, longitude/latitude
    zoom: 11 // starting zoom level
});


/*--------------------------------------------------------------------
Step 2: VIEW GEOJSON POINT DATA ON MAP
--------------------------------------------------------------------*/
let collision;

fetch('https://raw.githubusercontent.com/PauVicto/ggr472-lab4/refs/heads/main/ggr472-lab4-main/data/pedcyc_collision_06-21.geojson')
    .then(response => response.json())
    .then(data => {
        collision = data;
        console.log(collision);
        // Process the fetched GeoJSON data
    map.on('load', () => {
        // Add the collision data as a source and layer to the map
        map.addSource('collision', {
            type: 'geojson',
            data: collision
        });
        
        map.addLayer({
            id: 'collision-layer',
            type: 'circle',
            source: 'collision',
            paint: {
                'circle-radius': 5,
                'circle-color': '#FF0000',
                'circle-opacity': 0.8
            }
        });
        let envresult = turf.envelope(collision);
        console.log(envresult);
         
        let bbox = envresult.bbox;
        console.log(bbox);

        let hexgrid = turf.hexGrid(bbox, 0.5, {units: 'kilometers'});
        console.log(hexgrid);

         map.addSource('hexgrid', {
            type: 'geojson',
            data: hexgrid
        });
        
        map.addLayer({
            id: 'hexgrid-layer',
            type: 'fill',
            source: 'hexgrid',
            paint: {
                'fill-color': '#00FF00',
                'fill-opacity': 0.5,
                'fill-outline-color': '#000000'
            }
    });
    // End of map.on('load', ...)
}); 
});// <-- Add this closing brace to end the .then(data => { ... }) block
//HINT: Create an empty variable
//      Use the fetch method to access the GeoJSON from your online repository
//      Convert the response to JSON format and then store the response in your new variable



/*--------------------------------------------------------------------
    Step 3: CREATE BOUNDING BOX AND HEXGRID
--------------------------------------------------------------------*/
//HINT: All code to create and view the hexgrid will go inside a map load event handler
//      First create a bounding box around the collision point data
//      Access and store the bounding box coordinates as an array variable
//      Use bounding box coordinates as argument in the turf hexgrid function
//      **Option: You may want to consider how to increase the size of your bbox to enable greater geog coverage of your hexgrid
//                Consider return types from different turf functions and required argument types carefully here



/*--------------------------------------------------------------------
Step 4: AGGREGATE COLLISIONS BY HEXGRID
--------------------------------------------------------------------*/
//HINT: Use Turf collect function to collect all '_id' properties from the collision points data for each heaxagon
//      View the collect output in the console. Where there are no intersecting points in polygons, arrays will be empty



// /*--------------------------------------------------------------------
// Step 5: FINALIZE YOUR WEB MAP
// --------------------------------------------------------------------*/
//HINT: Think about the display of your data and usability of your web map.
//      Update the addlayer paint properties for your hexgrid using:
//        - an expression
//        - The COUNT attribute
//        - The maximum number of collisions found in a hexagon
//      Add a legend and additional functionality including pop-up windows

