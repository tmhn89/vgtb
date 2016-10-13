// config
var CENTER = [107.8462, 15.5776];
var ZOOM_LEVEL = 9;

require([
    "esri/Map",
    "esri/views/MapView",
    "esri/layers/FeatureLayer",
    "esri/layers/CSVLayer",
    "esri/renderers/SimpleRenderer",
    "esri/symbols/SimpleMarkerSymbol",
    "esri/PopupTemplate",
    "dojo/domReady!"
], function(Map, MapView, FeatureLayer, CSVLayer, SimpleRenderer, SimpleMarkerSymbol, PopupTemplate) {

    // todo: add the following layers:
    // 1. VGTB river basin boundary
    // 2. Stations location
    // 3. SPI calculated from JAXA's grid data
    var layer_boundary = new FeatureLayer({
        url: 'https://services7.arcgis.com/dzIg3kcuxPr7HZCe/arcgis/rest/services/VGTB_River_basin_boundary/FeatureServer/0'
    });

    var layer_stations = new CSVLayer('data/stations.csv', {
        class: 'layer-stations',
        renderer:
            new SimpleRenderer({
                symbol: new SimpleMarkerSymbol({
                    size: "16px",
                    color: [238, 69, 0, 0.5],
                    outline: {
                        width: 0.5,
                        color: "white"
                    }
                })
            }),
        popupTemplate:
            new PopupTemplate({
                title: '{name}',
                content:
                    '<p>latitude: {lat}</p>' +
                    '<p>longitude: {lng}</p>'
            }),
    });

    console.log(layer_stations);

    var layer_rain = new CSVLayer('data/vgtb.csv', {
        class: 'layer-rain',
        renderder:
            new SimpleRenderer({
                symbol: new SimpleMarkerSymbol({
                    size: "16px",
                    color: [0, 69, 238, 0.5],
                    outline: {
                        width: 0.5,
                        color: "white"
                    }
                })
            }),
        // popupTemplate:
        //     new PopupTemplate({
        //         title: '{rain}',
        //         content:
        //             '<p>latitude: {lat}</p>' +
        //             '<p>longitude: {lng}</p>'
        //     })
    });

    // map and views
    var map = new Map({
        basemap: 'gray'
    });

    map.add(layer_boundary);
    map.add(layer_stations);
    // map.add(layer_rain);

    var view = new MapView({
        container: "viewDiv",  // Reference to the scene div created in step 5
        map: map,  // Reference to the map object created before the scene
        zoom: ZOOM_LEVEL,  // Sets the zoom level based on level of detail (LOD)
        center: CENTER,  // Sets the center point of view in lon/lat
        constraints: { // disable zoom
            minZoom: ZOOM_LEVEL,
            maxZoom: ZOOM_LEVEL
        },
    });
});
