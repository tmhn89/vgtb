// config
var CENTER = [107.8462, 15.5776];
var ZOOM_LEVEL = 9;
var CREATING_AREA_FILE = false;

var START_YEAR = 2000;

var DEFAULT_YEAR = 2013;
var DEFAULT_MONTH = 1;

var map;

require([
    "esri/config",
    "esri/map",
    "esri/layers/FeatureLayer",
    "esri/layers/CSVLayer",
    "esri/renderers/SimpleRenderer",
    "esri/renderers/HeatmapRenderer",
    "esri/renderers/ClassBreaksRenderer",
    "esri/symbols/SimpleMarkerSymbol",
    "esri/symbols/SimpleLineSymbol",
    "esri/InfoTemplate",
    "esri/dijit/analysis/InterpolatePoints",
    "esri/Color",
    "dojo/domReady!"
], function(esriConfig,
    Map,
    FeatureLayer, CSVLayer,
    SimpleRenderer, HeatmapRenderer, ClassBreaksRenderer,
    SimpleMarkerSymbol, SimpleLineSymbol,
    InfoTemplate,
    InterpolatePoints,
    Color) {
        var today = new Date();
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

        var opacity = 0.75;
        var stationRenderer = new ClassBreaksRenderer(stationSymbol('rgba(255,255,255, '+opacity+')'), 'spi');
        stationRenderer.addBreak(-Infinity, -2, stationSymbol('rgba(115, 0, 0, '+opacity+')'));
        stationRenderer.addBreak(-1.99999, -1.5, stationSymbol('rgba(230, 0, 0, '+opacity+')'));
        stationRenderer.addBreak(-1.49999, -1, stationSymbol('rgba(230, 152, 0, '+opacity+')'));
        stationRenderer.addBreak(-0.99999, -0.5, stationSymbol('rgba(255, 211, 127, '+opacity+')'));
        stationRenderer.addBreak(-0.49999, -0.25, stationSymbol('rgba(225, 225, 0, '+opacity+')'));
        stationRenderer.addBreak(-0.25, 0.24999, stationSymbol('rgba(100, 200, 100, '+opacity+')'));
        stationRenderer.addBreak(0.25, 0.49999, stationSymbol('rgba(0, 170, 0, '+opacity+')'));
        stationRenderer.addBreak(0.5, 0.99999, stationSymbol('rgba(0, 160, 255, '+opacity+')'));
        stationRenderer.addBreak(1, 1.49999, stationSymbol('rgba(130, 0, 220, '+opacity+')'));
        stationRenderer.addBreak(1.5, 1.99999, stationSymbol('rgba(160, 0, 200, '+opacity+')'));
        stationRenderer.addBreak(2, Infinity, stationSymbol('rgba(115, 0, 0, '+opacity+')'));

        function stationSymbol(color) {
            var symbol = new SimpleMarkerSymbol({
                size: 8,
                color: new Color(color),
                outline: new SimpleLineSymbol(SimpleLineSymbol.STYLE_DOT, new Color('#fff'), 1)
            });
            symbol.setStyle(SimpleMarkerSymbol.STYLE_CIRCLE);

            return symbol;
        }

        var layerStationsOption = {
            class: 'layer-stations',
            infoTemplate:
                new InfoTemplate(
                    '${name}',
                    '<p>latitude: ${lat}</p>' +
                    '<p>longitude: ${lon}</p>' +
                    '<p>SPI: ${spi}</p>'
                ),
            // visible: false
        };

        var layerStations = new CSVLayer(spiStationFile(DEFAULT_YEAR, DEFAULT_MONTH, 3), layerStationsOption);
        layerStations.setRenderer(stationRenderer);

        // layer represent SPI
        var heatmapRenderer = new HeatmapRenderer({
            field: 'spi',
            // colorStops: [
            //     { value: -2, color: 'rgba(115, 0, 0, 0.5)' },
            //     { value: -1.5, color: 'rgba(230, 0, 0, 0.5)' },
            //     { value: -1, color: 'rgba(230, 152, 0, 0.5)' },
            //     { value: -0.5, color: 'rgba(225, 211, 127, 0.5)'},
            //     { value: -0.25, color: 'rgba(225, 225, 0, 0.5)'},
            //     { value: 3, color: 'transparent'}
            // ],
            // colors: ["rgba(0, 0, 255, 0)","rgb(0, 0, 255)","rgb(255, 0, 255)", "rgb(255, 0, 0)"],
            blurRadius: 18,
        });

        var gridRenderer = new ClassBreaksRenderer(gridSymbol('rgba(255,255,255, '+opacity+')'), 'spi');
        gridRenderer.addBreak(-Infinity, -2, gridSymbol('rgba(115, 0, 0, '+opacity+')'));
        gridRenderer.addBreak(-2, -1.5, gridSymbol('rgba(230, 0, 0, '+opacity+')'));
        gridRenderer.addBreak(-1.5, -1, gridSymbol('rgba(230, 152, 0, '+opacity+')'));
        gridRenderer.addBreak(-1, -0.5, gridSymbol('rgba(255, 211, 127, '+opacity+')'));
        gridRenderer.addBreak(-0.5, -0.25, gridSymbol('rgba(225, 225, 0, '+opacity+')'));
        gridRenderer.addBreak(-0.25, 0.25, gridSymbol('rgba(100, 200, 100, '+opacity+')'));
        gridRenderer.addBreak(0.25, 0.5, gridSymbol('rgba(0, 170, 0, '+opacity+')'));
        gridRenderer.addBreak(0.5, 1, gridSymbol('rgba(0, 160, 255, '+opacity+')'));
        gridRenderer.addBreak(1, 1.5, gridSymbol('rgba(130, 0, 220, '+opacity+')'));
        gridRenderer.addBreak(1.5, 2, gridSymbol('rgba(160, 0, 200, '+opacity+')'));
        gridRenderer.addBreak(2, Infinity, gridSymbol('rgba(115, 0, 0, '+opacity+')'));

        function gridSymbol(color) {
            var symbol = new SimpleMarkerSymbol({
                size: 28,
                color: new Color(color),
                outline: null
            });
            symbol.setStyle(SimpleMarkerSymbol.STYLE_SQUARE);

            return symbol;
        }

        var layerSPIOption = {
            class: 'layer-spi',
            infoTemplate:
            new InfoTemplate(
                'SPI = ${spi}',
                '<p>latitude: ${lat}</p>' +
                '<p>longitude: ${lon}</p>'
            ),
            visible: false
        };

        // default: last month spi, 6-month scale
        var layerSPI = new CSVLayer(spiGridFile(DEFAULT_YEAR, DEFAULT_MONTH, 3), layerSPIOption);
        // layerSPI.setRenderer(heatmapRenderer);
        layerSPI.setRenderer(gridRenderer);

        // map
        map = new Map('map', {
            basemap: 'osm',
            zoom: ZOOM_LEVEL,
            maxZoom: ZOOM_LEVEL,
            minZoom: ZOOM_LEVEL,
            slider: false,
            logo: false,
            center: CENTER,
        });

        map.addLayer(layerBoundary);
        map.addLayer(layerSPI);
        map.addLayer(layerStations);

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
        $("[type='number']").keypress(function (e) {
            e.preventDefault();
        });

        // $('#year').html(today.getFullYear());
        $('#year_input')
            // .val(today.getFullYear())
            .on('change', function() {
                var year = $(this).val();
                $('#year').html(year);

                if (year == today.getFullYear()) {
                    // month selection can not exceed last month
                    $('#month_input')
                        .attr('min', 1)
                        .attr('max', today.getMonth());
                    if ($('#month_input').val() > today.getMonth()) {
                        $('#month_input')
                            .val(today.getMonth())
                            .trigger('change');
                    }
                } else if (year == 2000) {
                    // data only from March 2000 and later
                    $('#month_input').attr('min', 3);
                    $('#month_input').attr('max', 12);
                } else {
                    $('#month_input').attr('min', 1);
                    $('#month_input').attr('max', 12);
                }
                // redraw layerSPI
                redrawSPILayer();
            });

        // $('#month').html(today.getMonth());
        $('#month_input')
            // .val(today.getMonth())
            // .attr('max', today.getMonth())
            .on('change', function() {
                $('#month').html($(this).val());
                redrawSPILayer();
            });

        $('#time_scale_input').on('change', function() {
            $('#time_scale').html($('#time_scale_input option:selected').text());
            redrawSPILayer();
        });

        $('#grid_toggle').click(function() {
            if($(this).html() === 'Show Grid') {
                $(this).html('Hide Grid');
                layerSPI.show();
            } else {
                $(this).html('Show Grid');
                layerSPI.hide();
            }
        });

        $('#stations_toggle').click(function() {
            if($(this).html() === 'Show Stations') {
                $(this).html('Hide Stations');
                layerStations.show();
            } else {
                $(this).html('Show Stations');
                layerStations.hide();
            }
        });

        function redrawSPILayer() {
            var year = $('#year_input').val();
            var month = $('#month_input').val();
            var scale = $('#time_scale_input').val();

            newGridUrl = spiGridFile(year,month,scale);
            map.removeLayer(layerSPI);
            layerSPI = new CSVLayer(newGridUrl, layerSPIOption);
            layerSPI.setRenderer(gridRenderer);
            layerSPI.redraw();
            map.addLayer(layerSPI);

            newStationUrl = spiStationFile(year,month,scale);
            map.removeLayer(layerStations);
            layerStations = new CSVLayer(newStationUrl, layerStationsOption);
            layerStations.setRenderer(stationRenderer);
            layerStations.redraw();
            map.addLayer(layerStations);
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

function spiGridFile(year,month,scale) {
    return 'data/spi/' + scale + '/' + year + '_' + month + '.csv';
}

function spiStationFile(year,month,scale) {
    return 'data/stations/spi/' + scale + '/' + year + '_' + month + '.csv';
}
