var defaultSrc = "/preview/spi/3/201604.png";

function reloadPreview() {
    var month = $('#month_input').val();
    var twoDigitMonth = ("0" + month).slice(-2);

    var year = $('#year_input').val();
    var scale = $('#time_scale_input').val();
    var filename = '/preview/spi/' + scale + '/' + year + twoDigitMonth + '.png';

    if (fileExists(filename)) {
        // loaded file successfully
        $('#preview img').attr('src', filename);
        $('.download-btn').attr('href', filename);
    } else {
        // if not, show message, preview and link not changed
        showMessage('No data available for selected time');
    }
}

function fileExists(url) {
    var http = new XMLHttpRequest();
    http.open('HEAD', url, false);
    http.send();
    return http.status!=404;
}

$(document).ready(function() {
    var today = new Date();

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
            }

            reloadPreview();
        });

    $('#month_input')
        .on('change', function() {
            $('#month').html($(this).val());
            reloadPreview();
        });

    $('#time_scale_input').on('change', function() {
        $('#time_scale').html($('#time_scale_input option:selected').text());
        reloadPreview();
    });
});
