// config
var CENTER = [107.8462, 15.5776];
var ZOOM_LEVEL = 9;

var map;

require([
    "esri/map",
    "esri/layers/FeatureLayer",
    "esri/layers/CSVLayer",
    "esri/renderers/SimpleRenderer",
    "esri/renderers/HeatmapRenderer",
    "esri/symbols/SimpleMarkerSymbol",
    "esri/InfoTemplate",
    "esri/dijit/analysis/OverlayLayers",
    "dojo/domReady!"
], function(Map,
    FeatureLayer, CSVLayer,
    SimpleRenderer, HeatmapRenderer,
    SimpleMarkerSymbol,
    InfoTemplate,
    OverlayLayers) {

        // todo: add the following layers:
        // 1. VGTB river basin boundary
        // 2. Stations location
        // 3. SPI calculated from JAXA's grid data
        var layerBoundary = new FeatureLayer(
            'https://services7.arcgis.com/dzIg3kcuxPr7HZCe/arcgis/rest/services/VGTB_River_basin_boundary/FeatureServer/0'
        );

        var layerStations = new CSVLayer('data/stations.csv', {
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
            infoTemplate:
            new InfoTemplate(
                '${name}',
                '<p>latitude: ${lat}</p>' +
                '<p>longitude: ${lng}</p>'
            ),
        });

        var layerRain = new CSVLayer('data/vgtb.csv', {
            class: 'layer-rain',
            infoTemplate:
            new InfoTemplate(
                '${rain}',
                '<p>latitude: ${lat}</p>' +
                '<p>longitude: ${lng}</p>'
            ),
        });

        var heatmapRenderer = new HeatmapRenderer({
            field: 'rain',
            colors: ["rgba(0, 0, 255, 0)","rgb(0, 0, 255)","rgb(255, 0, 255)", "rgb(255, 0, 0)"],
            colorStops: [
                { ratio: 0, color: 'transparent' },
                { ratio: 0.1, color: 'rgba(52, 152, 219, 0.3)' },
                { ratio: 0.5, color: 'rgba(52, 152, 219, 0.5)' },
                { ratio: 0.75, color: 'rgba(41, 128, 185, 0.9)'}
            ],
            blurRadius: 12,
            maxPixelIntensity: 80,
            minPixelIntensity: 10,
        });

        layerRain.setRenderer(heatmapRenderer);

        // map
        map = new Map('map', {
            basemap: 'gray',
            zoom: ZOOM_LEVEL,
            maxZoom: ZOOM_LEVEL,
            minZoom: ZOOM_LEVEL,
            slider: false,
            logo: false,
            center: CENTER,
        });

        map.addLayer(layerBoundary);
        map.addLayer(layerStations);
        map.addLayer(layerRain);

        map.on('update-end', function() {
            map.disableMapNavigation();
            // console.log(getVGTBPoints(map.getLayer('graphicsLayer4'), map.getLayer('graphicsLayer2')));
        });
    });

// get points inside vgtb river basin area
function getVGTBPoints(rainLayer, boundaryLayer) {
    var boundary_polygon = boundaryLayer.graphics[0].geometry;

    var points = [];
    rainLayer.graphics.forEach(function(item, index) {
        if (boundary_polygon.contains(item.geometry)) {
            points.push({
                lat: item.attributes.lat,
                lng: item.attributes.lng,
                rain: item.attributes.rain
            });
        }
    })
    return JSON.stringify(points);
}
