// config
var CENTER = [107.8462, 15.5776];
var ZOOM_LEVEL = 9;
var CREATING_AREA_FILE = false;

var START_YEAR = 2000;

var DEFAULT_YEAR = 2017;
var DEFAULT_MONTH = 2;

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
        // var layerBoundary = new FeatureLayer(
        //     'https://services6.arcgis.com/4zw6b4Op5gFRxEVR/arcgis/rest/services/Basin_outer_bnd_27_09_2011/FeatureServer/0',
        //     {
        //         class: 'layer-boundary',
        //     }
        // );

        var opacity = 0.75;
        var gridRenderer = new ClassBreaksRenderer(gridSymbol('rgba(255,255,255, '+opacity+')'), 'spi');
        gridRenderer.addBreak(-Infinity, -2, gridSymbol('rgba(115, 0, 0, '+opacity+')'));
        gridRenderer.addBreak(-2, -1.5, gridSymbol('rgba(230, 0, 0, '+opacity+')'));
        gridRenderer.addBreak(-1.5, -1, gridSymbol('rgba(230, 152, 0, '+opacity+')'));
        gridRenderer.addBreak(-1, -0.5, gridSymbol('rgba(255, 211, 127, '+opacity+')'));
        gridRenderer.addBreak(-0.5, -0.25, gridSymbol('rgba(232,229,131, '+opacity+')'));
        gridRenderer.addBreak(-0.25, 0.25, gridSymbol('rgba(225,225,0, '+opacity+')'));
        gridRenderer.addBreak(0.25, 0.5, gridSymbol('rgba(213,235,157, '+opacity+')'));
        gridRenderer.addBreak(0.5, 1, gridSymbol('rgba(192,217,129, '+opacity+')'));
        gridRenderer.addBreak(1, 1.5, gridSymbol('rgba(163,209,127, '+opacity+')'));
        gridRenderer.addBreak(1.5, 2, gridSymbol('rgba(123,197,125, '+opacity+')'));
        gridRenderer.addBreak(2, Infinity, gridSymbol('rgba(100, 200, 100, '+opacity+')'));

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

        // map.addLayer(layerBoundary);
        map.addLayer(layerSPI);

        map.on('update-end', function() {
            map.disableMapNavigation();

            // $('#vgtbBoundary').append($('#' + layerBoundary.id + '_layer > path'));
            if ($('#vgtbBoundary *').length > 0) {
                // $('#map_container, img:not([id*=map_layer])')
                $('#map_layer0, #map_gc > g')
                    .css('-webkit-clip-path', 'url("#vgtbBoundary")')
                    .css('-clip-path', 'url("#vgtbBoundary")');
                $('#map').css('opacity', 1);
            }

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

        $('#month_input')
            .on('change', function() {
                $('#month').html($(this).val());
                redrawSPILayer();
            });

        $('#time_scale_input').on('change', function() {
            $('#time_scale').html($('#time_scale_input option:selected').text());
            redrawSPILayer();
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

            $('#grid_toggle').html('Hide Grid');
            layerSPI.show();
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
    var twoDigitMonth = ("0" + month).slice(-2);
    return 'data/spi/' + scale + '/' + year + '_' + twoDigitMonth + '.csv';
}

function spiStationFile(year,month,scale) {
    var twoDigitMonth = ("0" + month).slice(-2);
    return 'data/stations/spi/' + scale + '/' + year + '_' + twoDigitMonth + '.csv';
}

var spiScales = [
    {min:2, color:'rgba(100,200,100,1)', text:'Extremely moist'},
    {min:1.5, max: 2, color:'rgba(123,197,125,1)', text:'Very severe moist'},
    {min:1, max: 1.49, color:'rgba(163,209,127,1)', text:'Severe moist'},
    {min:0.5, max: 0.99, color:'rgba(192,217,129,1)', text:'Moderate moist'},
    {min:0.25, max: 0.49, color:'rgba(213,235,157,1)', text:'Mild moist'},
    {min:-0.25, max: 0.24, color:'rgba(225,225,0,1)', text:'Near normal'},
    {min:-0.49, max: -0.25, color:'rgba(232,229,131,1);', text:'Mild drought'},
    {min:-0.99, max: -0.5, color:'rgba(225,211,127,1)', text:'Moderate drought'},
    {min:-1.49, max: -1, color:'rgba(230,152,0,1)', text:'Severe drought'},
    {min:-1.99, max: -1.5, color:'rgba(230,0,0,1)', text:'Very severe drought'},
    {max: -2, color:'rgba(115,0,0,1)', text: 'Extremely drought'}
];

$(document).ready(function() {
    $.each(spiScales, function(index, scale) {
        var output = '<tr>' +
            '<td>' + '<div class="color-block" style="background-color:'+ scale.color +'"></div>' + '</td>';
        output += '<td class="text-center">';
        if (scale.min === undefined) {
            output += 'less than ' + scale.max;
        } else if (scale.max === undefined) {
            output += 'more than ' + scale.min;
        } else {
            output += scale.min + ' to ' + scale.max;
        }
        output += '</td>';
        output += '<td>' + scale.text + '</td>' +
            '</tr>';

        $('#legend table').append(output);
    });
});
