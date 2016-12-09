// config
var CENTER = [107.8462, 15.5776];
var ZOOM_LEVEL = 9;
var CREATING_AREA_FILE = false;

var START_YEAR = 2000;

var DEFAULT_YEAR = 2016;
var DEFAULT_MONTH = 12;
var DEFAULT_DAY = 07;

var map;

require([
    "esri/config",
    "esri/map",
    "esri/layers/FeatureLayer",
    "esri/layers/CSVLayer",
    "esri/renderers/SimpleRenderer",
    "esri/renderers/ClassBreaksRenderer",
    "esri/symbols/SimpleMarkerSymbol",
    "esri/symbols/SimpleLineSymbol",
    "esri/InfoTemplate",
    "esri/Color",
    "dojo/domReady!"
], function(esriConfig,
    Map,
    FeatureLayer, CSVLayer,
    SimpleRenderer, ClassBreaksRenderer,
    SimpleMarkerSymbol, SimpleLineSymbol,
    InfoTemplate,
    Color) {
        var layerBoundary = new FeatureLayer(
            'https://services7.arcgis.com/o5DIa73O7QiRWn8s/arcgis/rest/services/Basin_outer_bnd_27_09_2011/FeatureServer/0',
            {
                class: 'layer-boundary',
            }
        );

        var opacity = 0.75;
        var gridRenderer = new ClassBreaksRenderer(gridSymbol('rgba(255,255,255, '+opacity+')'), 'rainRate');
        gridRenderer.addBreak(0, 16, gridSymbol('rgba(225, 245, 254, '+opacity+')'));
        gridRenderer.addBreak(16, 32, gridSymbol('rgba(179, 229, 252, '+opacity+')'));
        gridRenderer.addBreak(32, 48, gridSymbol('rgba(129, 212, 250, '+opacity+')'));
        gridRenderer.addBreak(48, 64, gridSymbol('rgba(79, 295, 247, '+opacity+')'));
        gridRenderer.addBreak(64, 80, gridSymbol('rgba(41, 182, 246, '+opacity+')'));
        gridRenderer.addBreak(80, 96, gridSymbol('rgba(3, 169, 244, '+opacity+')'));
        gridRenderer.addBreak(96, 112, gridSymbol('rgba(3, 155, 229, '+opacity+')'));
        gridRenderer.addBreak(112, 128, gridSymbol('rgba(2, 136, 209, '+opacity+')'));
        gridRenderer.addBreak(128, 144, gridSymbol('rgba(2, 119, 189, '+opacity+')'));
        gridRenderer.addBreak(144, Infinity, gridSymbol('rgba(1, 87, 155, '+opacity+')'));

        var gridDailyRenderer = new ClassBreaksRenderer(gridSymbol('rgba(255,255,255, '+opacity+')'), 'rainRate');
        gridDailyRenderer.addBreak(0, 2, gridSymbol('rgba(225, 245, 254, '+opacity+')'));
        gridDailyRenderer.addBreak(2, 4, gridSymbol('rgba(179, 229, 252, '+opacity+')'));
        gridDailyRenderer.addBreak(4, 6, gridSymbol('rgba(129, 212, 250, '+opacity+')'));
        gridDailyRenderer.addBreak(6, 8, gridSymbol('rgba(79, 295, 247, '+opacity+')'));
        gridDailyRenderer.addBreak(8, 10, gridSymbol('rgba(41, 182, 246, '+opacity+')'));
        gridDailyRenderer.addBreak(10, 12, gridSymbol('rgba(3, 169, 244, '+opacity+')'));
        gridDailyRenderer.addBreak(12, 14, gridSymbol('rgba(3, 155, 229, '+opacity+')'));
        gridDailyRenderer.addBreak(14, 16, gridSymbol('rgba(2, 136, 209, '+opacity+')'));
        gridDailyRenderer.addBreak(16, 18, gridSymbol('rgba(2, 119, 189, '+opacity+')'));
        gridDailyRenderer.addBreak(18, Infinity, gridSymbol('rgba(1, 87, 155, '+opacity+')'));

        function gridSymbol(color) {
            var symbol = new SimpleMarkerSymbol({
                size: 28,
                color: new Color(color),
                outline: null
            });
            symbol.setStyle(SimpleMarkerSymbol.STYLE_SQUARE);

            return symbol;
        }

        var layerGridOption = {
            class: 'layer-grid',
            infoTemplate:
            new InfoTemplate({
                title: 'Precipitation = ${rainRate} mm',
                content: '<p>latitude: ${lat}</p>' + '<p>longitude: ${lon}</p>'
            })
        };

        // default: last month spi, 6-month scale
        var today = new Date();
        var layerGrid = new CSVLayer(precipGridFile(today.getFullYear(), today.getMonth()+1, today.getDate()-1), layerGridOption);
        layerGrid.setRenderer(gridDailyRenderer);

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
        map.addLayer(layerGrid);

        map.on('update-end', function() {
            map.disableMapNavigation();
            $('#vgtbBoundary').append($('#' + layerBoundary.id + '_layer > path'));

            if ($('#vgtbBoundary *').length > 0) {
                $('#map_container, img:not([id*=map_layer])')
                    .css('-webkit-clip-path', 'url("#vgtbBoundary")')
                    .css('-clip-path', 'url("#vgtbBoundary")');
                $('#map').css('opacity', 1);
            }
        });

        // map controller
        $("[type='number']").keypress(function (e) {
            // e.preventDefault();
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
                redrawGrid();
            });

        $('#month_input')
            .on('change', function() {
                $('#month').html($(this).val());
                redrawGrid();
            });

        $('#day_input')
            .on('change', function() {
                $('#day').html($(this).val());
                if ($(this).val() === '') {
                    $('#day_sep').hide();
                    $('#day_prep').hide();
                    $('#month_prep').show();
                } else {
                    $('#day_sep').show();
                    $('#day_prep').show();
                    $('#month_prep').hide();
                }
                redrawGrid();
            });

        function redrawGrid() {
            var year = $('#year_input').val();
            var month = $('#month_input').val();
            var day = $('#day_input').val();

            newGridUrl = precipGridFile(year,month,day);
            if (!newGridUrl) {

            } else {
                map.removeLayer(layerGrid);
                layerGrid = new CSVLayer(newGridUrl, layerGridOption);
                if (day === '') {
                    layerGrid.setRenderer(gridRenderer);
                    loadLegend(monthlyLegends);
                } else {
                    layerGrid.setRenderer(gridDailyRenderer);
                    loadLegend(dailyLegends);
                }
                layerGrid.redraw();
                map.addLayer(layerGrid);
            }
        }
    });

    function precipGridFile(year,month,day) {
        var twoDigitMonth = ("0" + month).slice(-2);
        if (isNaN(twoDigitMonth)) {
            return false;
        }

        if (day !== '') {
            var twoDigitDay = ("0" + day).slice(-2);
            if (isNaN(twoDigitDay)) {
                return false;
            }
            return 'data/jaxa_daily/' + year + twoDigitMonth + twoDigitDay + '.csv';
        }

        return 'data/jaxa_monthly/' + year + twoDigitMonth + '.csv';
    }

    $(function() {
        loadLegend(dailyLegends);
        // set default input to yesterday
        var today = new Date();
        today.setDate(today.getDate() - 1);

        var day = ("0" + (today.getDate())).slice(-2)
        $('#day').html(day);
        $('#day_input').val(day);

        var month = ("0" + (today.getMonth()+1)).slice(-2);
        $('#month').html(month);
        $('#month_input').val(month);

        var year = today.getFullYear();
        $('#year').html(year);
        $('#year_input').val(year);
    })

    if (!String.prototype.format) {
        String.prototype.format = function() {
            var args = arguments;
            return this.replace(/{(\d+)}/g, function(match, number) {
                return typeof args[number] != 'undefined' ? args[number] : match;
            });
        };
    }

    var monthlyLegends = [
        { min: 0, max: 0, color: 'rgb(255, 255, 255)' },
        { min: 0, max: 16, color: 'rgb(225, 245, 254)' },
        { min: 16, max: 32, color: 'rgb(179, 229, 252)' },
        { min: 32, max: 48, color: 'rgb(129, 212, 250)' },
        { min: 48, max: 64, color: 'rgb(79, 295, 247)' },
        { min: 64, max: 80, color: 'rgb(41, 182, 246)' },
        { min: 80, max: 96, color: 'rgb(3, 169, 244)' },
        { min: 96, max: 112, color: 'rgb(3, 155, 229)' },
        { min: 112, max: 128, color: 'rgb(2, 136, 209)' },
        { min: 128, max: 144, color: 'rgb(2, 119, 189)' },
        { min: 144, max: Infinity, color: 'rgb(1, 87, 155)' }
    ];
    var dailyLegends = [
        { min: 0, max: 0, color: 'rgb(255, 255, 255)' },
        { min: 0, max: 2, color: 'rgb(225, 245, 254)' },
        { min: 2, max: 4, color: 'rgb(179, 229, 252)' },
        { min: 4, max: 6, color: 'rgb(129, 212, 250)' },
        { min: 6, max: 8, color: 'rgb(79, 295, 247)' },
        { min: 8, max: 10, color: 'rgb(41, 182, 246)' },
        { min: 10, max: 12, color: 'rgb(3, 169, 244)' },
        { min: 12, max: 14, color: 'rgb(3, 155, 229)' },
        { min: 14, max: 16, color: 'rgb(2, 136, 209)' },
        { min: 16, max: 18, color: 'rgb(2, 119, 189)' },
        { min: 18, max: Infinity, color: 'rgb(1, 87, 155)' }
    ];

    function loadLegend(legends) {
        $('#legend table').html('');
        $.each(legends, function(index, legend) {
            var output = '<tr>' +
                '<td>' + '<div class="color-block" style="background-color:'+ legend.color +'"></div>' + '</td>';
            if (legend.min === legend.max) {
                output += '<td>' + legend.max + '</td>';
            } else if (legend.max === Infinity) {
                output += '<td>' + 'more than ' + legend.min + '</td>';
            } else {
                output += '<td>' + legend.min + ' to ' + legend.max + '</td>';
            }
            output += '</tr>';

            $('#legend table').append(output);
        })
    }
