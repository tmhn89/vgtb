var scales = [1,3,6,12];
var stations = ['Tra My','Kham Duc','Tien Phuoc','Nong Son','Thanh My','Giao Thuy','Cau Lau','Hoi An','Ai Nghia','Cam Le','Da Nang'];

$(document).ready(function() {

    $.each(scales,function(i, scale) {
        $.ajax({
            type: 'GET',
            url: 'data/stations/heatmap_'+scale+'.csv',
            dataType: 'text',
            success: function(data) {
                var divId = 'spi_'+scale;
                $('#spis_wrap').append('<div class="spis" id="'+divId+'"><h3>SPI '+scale+' month</h3></div>');

                stationDOM = '';
                $.each(stations, function(num, station) {
                    stationDOM += '<div class="cell">'+station+'</div>';
                })

                var spiDOM = '<div class="row stations">'+stationDOM+'</div>';
                $.each(data.split('\n'), function(index, row) {
                    if (index > 0 && row != '') {
                        year = parseInt(index/12 + 2000);
                        rowDOM = '';
                        if (index % 12 === 1) {
                            rowDOM += '<div class="year" data-year="'+year+'" data-scale="'+scale+'">';
                        }
                        rowDOM += '<div class="row">';
                        month = index%12 === 0 ? 12 : index%12;
                        rowDOM += '<div class="cell month">'+month+'</div>';
                        $.each(row.split(','), function(index, cell) {
                            rowDOM += '<div class="cell" style="background-color: '+getColor(cell)+'">' + cell + '</div>';
                        })
                        rowDOM += '</div>';
                        if (index % 12 === 0) {
                            if (scale == 1) {
                                rowDOM += '<div class="legend">'+ (year-1) +'</div>';
                            }
                            rowDOM += '</div>';
                        }
                        spiDOM += rowDOM;
                    }
                });
                $('#' + divId).append(spiDOM);

                $('.year').hover(function(){
                    $('#tooltip').html('<h4>'+$(this).attr('data-year') + ' - SPI ' + $(this).attr('data-scale')+' month</h4>');
                    $('#tooltip').append('<div class="row stations"><div class="cell"></div>'+stationDOM+'</div>');
                    $('#tooltip').append($(this).html());
                    $('#tooltip').show();
                });
                $('.year').mouseleave(function() {
                    $('#tooltip').hide();
                });
            }
        })
    })
});

function getColor(value) {
    var opacity = 1;
    if (value < -2) {
        return 'rgba(115, 0, 0, '+opacity*4+')';
    } else if (value < -1.5) {
        return 'rgba(230, 0, 0, '+opacity*4+')';
    } else if (value < -1) {
        return 'rgba(230, 152, 0, '+opacity*4+')';
    } else if (value < -0.5) {
        return 'rgba(225, 211, 127, '+opacity*4+')';
    } else if (value < -0.25) {
        return 'rgba(225, 225, 0, '+opacity+')';
    } else if (value < 0.24999) {
        return 'rgba(100, 200, 100, '+opacity+')';
    } else if (value < 0.49999) {
        return '#e8e583';
        return 'rgba(0, 170, 0, '+opacity+')';
    } else if (value < 0.99999) {
        return '#c0d981';
        return 'rgba(0, 160, 255, '+opacity+')';
    } else if (value < 1.49999) {
        return '#a3d17f';
        return 'rgba(130, 0, 220, '+opacity+')';
    } else if (value < 1.99999) {
        return '#a2d07f';
        return 'rgba(160, 0, 200, '+opacity+')';
    }
    return '#7bc57d';
    return 'rgba(115, 0, 0, '+opacity+')';
}

window.onmousemove = function (e) {
    var tooltipW = 360;
    var tooltipH = 210;
    var offset = 30;

    var x = (e.clientX),
        y = (e.clientY);
    if ($(window).height() - y < tooltipH) {
        $('#tooltip')[0].style.top = y - offset - tooltipH + 'px';
    } else {
        $('#tooltip')[0].style.top = y + offset + 'px';
    }

    if ($(window).height() - x < tooltipW) {
        $('#tooltip')[0].style.left = x - offset - tooltipW + 'px';
    } else {
        $('#tooltip')[0].style.left = x + offset + 'px';
    }
};
