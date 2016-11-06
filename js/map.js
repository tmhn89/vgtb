// config
var CENTER = [107.8462, 15.5776];
var ZOOM_LEVEL = 9;
var CREATING_AREA_FILE = false;

var START_YEAR = 2000;

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
        var opacity = 0.5;
        var cbRenderer = new ClassBreaksRenderer(createSymbol('rgba(255,255,255, '+opacity+')'), 'spi');
        cbRenderer.addBreak(-Infinity, -2, createSymbol('rgba(115, 0, 0, '+opacity+')'));
        cbRenderer.addBreak(-2, -1.5, createSymbol('rgba(230, 0, 0, '+opacity+')'));
        cbRenderer.addBreak(-1.5, -1, createSymbol('rgba(230, 152, 0, '+opacity+')'));
        cbRenderer.addBreak(-1, -0.5, createSymbol('rgba(255, 211, 127, '+opacity+')'));
        cbRenderer.addBreak(-0.5, -0.25, createSymbol('rgba(225, 225, 0, '+opacity+')'));

        function createSymbol(color) {
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
        };

        var today = new Date();
        // default: last month spi, 6-month scale
        var layerSPI = new CSVLayer(spiFile(today.getFullYear(), today.getMonth(), 3), layerSPIOption);
        // layerSPI.setRenderer(heatmapRenderer);
        layerSPI.setRenderer(cbRenderer);

        // map
        map = new Map('map', {
            basemap: 'national-geographic',
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

        // map.on('layer-add-result', function(target) {
        //     // check if SPI layer added.
        //     if (target.layer.url.substring(0,8) === 'data/spi') {
        //         var interpolateParams = {
        //             id: "analysisTool",
        //             inputLayer: layerSPI,
        //             analysisGpServer: 'http://analysis.arcgis.com/arcgis/rest/services/tasks/GPServer',
        //             portalUrl: "http://services.arcgisonline.com",
        //             boundingPolygonLayer: layerBoundary,
        //             showHelp: false,
        //             showSelectAnalysisLayer: false,
        //             showCredits: false,
        //             map: map,
        //             returnFeatureCollection: true
        //         };
        //         var interpolate = new InterpolatePoints(interpolateParams, "interpolate");
        //         interpolate.startup();
        //
        //         interpolate.on("job-failed", function(params){
        //             console.log('failed');
        //             console.log('params');
        //         });
        //         interpolate.on("job-status", function(status){
        //             if(status.jobStatus === 'esriJobFailed'){
        //                 console.log("Job Failed: " + status.messages[0].description);
        //             }
        //         });
        //         interpolate.on("job-submit", function(result){
        //             //display the loading icon
        //             console.log('Submitting job');
        //             console.log(result);
        //         });
        //         //The hot spots analysis has finished successfully - display the results
        //         interpolate.on("job-result", function(result){
        //             //hide the loading icon
        //
        //             //add the results to the map and display the legend.
        //             if(result.value){
        //                 var template = new InfoTemplate("Results", "${*}");
        //                 var resultLayer = new FeatureLayer(result.value.url || result.value, {
        //                     infoTemplate: template,
        //                     outFields: ["*"],
        //                     opacity: 0.7, //default too transparent
        //                     id: "resultLayer"
        //                 });
        //
        //                 map.addLayer(resultLayer);
        //                 //refresh and display the legend
        //             }
        //             if(result.analysisReport){
        //                 //hide the hot spots panel and show the analysis info.
        //                 console.log(result.analysisReport);
        //             }
        //
        //             //re-enable the hot spots tool
        //             interpolate.set("disableRunAnalysis", false);
        //         });
        //     }
        //     // Run interpolate point analysis
        // });

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

        $('#year').html(today.getFullYear());
        $('#year_input')
            .val(today.getFullYear())
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

        $('#month').html(today.getMonth());
        $('#month_input')
            .val(today.getMonth())
            .attr('max', today.getMonth())
            .on('change', function() {
                $('#month').html($(this).val());
                redrawSPILayer();
            });

        $('#time_scale_input').on('change', function() {
            $('#time_scale').html($('#time_scale_input option:selected').text());
            redrawSPILayer();
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

        function redrawSPILayer() {
            var year = $('#year_input').val();
            var month = $('#month_input').val();
            var scale = $('#time_scale_input').val();
            newUrl = spiFile(year,month,scale);

            map.removeLayer(layerSPI);
            layerSPI = new CSVLayer(newUrl, layerSPIOption);
            // layerSPI.setRenderer(heatmapRenderer);
            layerSPI.setRenderer(cbRenderer);
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

function spiFile(year,month,scale) {
    return 'data/spi/' + scale + '/' + year + '_' + month + '.csv';
}
