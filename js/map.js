// config
var CENTER = [107.8462, 15.5776];
var ZOOM_LEVEL = 9;
var CREATING_AREA_FILE = false;

var CURRENT_YEAR = 2016;

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
            'https://services7.arcgis.com/dzIg3kcuxPr7HZCe/arcgis/rest/services/VGTB_River_basin_boundary/FeatureServer/0',
            {
                class: 'layer-boundary',
            }
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
            visible: false
        });

        // layer represent SPI
        var heatmapRenderer = new HeatmapRenderer({
            field: 'rain',
            colorStops: [
                { value: -2, color: 'rgba(115, 0, 0, 0.5)' },
                { value: -1.5, color: 'rgba(230, 0, 0, 0.5)' },
                { value: -1, color: 'rgba(230, 152, 0, 0.5)' },
                { value: -0.5, color: 'rgba(225, 211, 127, 0.5)'},
                { value: -0.25, color: 'rgba(225, 225, 0, 0.5)'},
                { value: 3, color: 'transparent'}
            ],
            blurRadius: 15,
        });

        var layerSPIOption = {
            class: 'layer-rain',
            infoTemplate:
            new InfoTemplate(
                '${rain}',
                '<p>latitude: ${lat}</p>' +
                '<p>longitude: ${lng}</p>'
            ),
        };

        var layerSPI = new CSVLayer('data/limited.csv', layerSPIOption);
        layerSPI.setRenderer(heatmapRenderer);

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
        map.addLayer(layerSPI);

        map.on('update-end', function() {
            map.disableMapNavigation();

            $('#vgtbBoundary').append($('#' + layerBoundary.id + '_layer > path'));

            if (CREATING_AREA_FILE) {
                // create csv content
                var csvContent = 'data:text/csv;charset=utf-8,';
                csvContent += getVGTBPoints(map.getLayer('graphicsLayer4'), map.getLayer('graphicsLayer2'), 'csv');
                // download csv file
                var encodedUri = encodeURI(csvContent);
                window.open(encodedUri);
                var link = document.createElement('a');
                link.setAttribute('href', encodedUri);
                link.setAttribute('download', 'limited.csv');
                document.body.appendChild(link); // Required for FF

                link.click();
            }
        });

        // map controller
        $('#year').html(CURRENT_YEAR);
        $('#year_input').val(CURRENT_YEAR);

        $('#year_input').on('change paste keyup', function() {
            $('#year').html($(this).val());
            // redraw layerSPI
            redrawSPILayer('data/area.csv');
        });

        $('#period_input').on('change', function() {
            $('#period').html($(this).val());
            redrawSPILayer('data/test_month.csv');
        });

        $('#stations_toggle').click(function() {
            if($(this).html() === 'Show') {
                $(this).html('Hide');
                layerStations.show();
            } else {
                $(this).html('Show');
                layerStations.hide();
            }
        });

        function redrawSPILayer(newUrl) {
            map.removeLayer(layerSPI);
            layerSPI = new CSVLayer(newUrl, layerSPIOption);
            layerSPI.setRenderer(heatmapRenderer);
            layerSPI.redraw();
            map.addLayer(layerSPI);
        }

    });

// get points inside vgtb river basin area
function getVGTBPoints(rainLayer, boundaryLayer, format) {
    var boundary_polygon = boundaryLayer.graphics[0].geometry;

    switch (format) {
        case 'json':
            var points = [];
            rainLayer.graphics.forEach(function(item) {
                if (boundary_polygon.contains(item.geometry)) {
                    points.push({
                        lat: item.attributes.lat,
                        lng: item.attributes.lng,
                        rain: item.attributes.rain
                    });
                }
            });
            return JSON.stringify(points);
        case 'csv':
            csv = 'lat,lng,rain\n';
            rainLayer.graphics.forEach(function(item) {
                if (boundary_polygon.contains(item.geometry)) {
                    csv+= item.attributes.lat + ',' + item.attributes.lng + ',' + item.attributes.rain + '\n';
                }
            });
            return csv;
        default:
            break;
    }
}
