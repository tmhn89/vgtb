$(document).ready(function() {
    $.ajax({
        type: 'GET',
        url: 'data/stations/heatmap_3.csv',
        dataType: 'text',
        success: function(data) {
            $.each(data.split('\n'), function(index, row) {
                if (index > 0) {
                    rowDOM = '<div class="row">';
                    $.each(row.split(','), function(index, cell) {
                        rowDOM += '<div class="cell" style="background-color: '+getColor(cell)+'">' + cell + '</div>';
                    })
                    rowDOM += '</div>';
                    if (index % 12 === 1) {
                        $('#spis').append('<div class="year">');
                    }
                    $('#spis').append(rowDOM);
                    if (index % 12 === 0) {
                        console.log(index);
                        $('#spis').append('</div>');
                    }
                }
            });
        }
    })
});

function getColor(value) {
    var opacity = 0.5;
    if (value < -2) {
        return 'rgba(115, 0, 0, '+opacity+')';
    } else if (value < -1.5) {
        return 'rgba(230, 0, 0, '+opacity+')';
    } else if (value < -1) {
        return 'rgba(230, 152, 0, '+opacity+')';
    } else if (value < -0.5) {
        return 'rgba(225, 211, 127, '+opacity+')';
    } else if (value < -0.25) {
        return 'rgba(225, 225, 0, '+opacity+')';
    } else if (value < 0.24999) {
        return 'rgba(100, 200, 100, '+opacity+')';
    } else if (value < 0.49999) {
        return 'rgba(0, 170, 0, '+opacity+')';
    } else if (value < 0.99999) {
        return 'rgba(0, 160, 255, '+opacity+')';
    } else if (value < 1.49999) {
        return 'rgba(130, 0, 220, '+opacity+')';
    } else if (value < 1.99999) {
        return 'rgba(160, 0, 200, '+opacity+')';
    }
    return 'rgba(115, 0, 0, '+opacity+')';
}
