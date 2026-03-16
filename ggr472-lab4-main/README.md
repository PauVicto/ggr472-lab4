# GGR472 Lab 4: Incorporating GIS analysis into web maps using Turf.js
 
This repository focuses on utilizing visualized outputs using [Turf.js](https://turfjs.org/) vand [Mapbox GL JS](https://docs.mapbox.com/mapbox-gl-js/api/) to perform spacial analysis of pedestrian and cycling related collisions within TORONTO.

## Map Contents
This webmap includes:
- collision points (red dots)
- hexgrid generated from collision data using Turf.js
- hexgrid used to visualize spatial analysis of collision points included in legend based on range categories per hexagon
- A legend showcasing range values of collisions per hexagon and collision points
- Popup windows showing number of collision/hexagon
0 layer toggle checkboxes for hexgrid and collision points
- navigation control, zoom levels


## Repository Contents
- `data/pedcyc_collision_06-21.geojson`: Data file containing point locations of road collisions involving pedestrian and cyclists between 2006 and 2021 in Toronto (GEOJSON FILE)
- `instructions/GGR472_Lab4`: Instructions document explaining steps required to complete the lab
- `index.html`: HTML file to render the map
- `style.css`: CSS file for positioning the map interface
- `script.js`: JavaScript file template to be updated to include code that creates and visualizes and hexgrid map based on the collision data


