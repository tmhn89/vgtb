$(document).ready(function() {
    loadLegend();
});

var spiScales = [
    {min:2, color:'rgba(244,0,244,1)', text:'Extremely moist'},
    {min:1.5, max: 2, color:'rgba(160,0,200,1)', text:'Very severe moist'},
    {min:1, max: 1.49, color:'rgba(130,0,220,1)', text:'Severe moist'},
    {min:0.5, max: 0.99, color:'rgba(0,160,255,1)', text:'Moderate moist'},
    {min:0.25, max: 0.49, color:'rgba(0,170,0,1)', text:'Mild moist'},
    {min:-0.25, max: 0.24, color:'rgba(100,200,100,1)', text:'Near normal'},
    {min:-0.49, max: -0.25, color:'rgba(225,225,0,1);', text:'Mild drought'},
    {min:-0.99, max: -0.5, color:'rgba(225,211,127,1)', text:'Moderate drought'},
    {min:-1.49, max: -1, color:'rgba(230,152,0,1)', text:'Severe drought'},
    {min:-1.99, max: -1.5, color:'rgba(230,0,0,1)', text:'Very severe drought'},
    {max: -2, color:'rgba(115,0,0,1)', text: 'Extremely drought'}
];

function loadLegend() {
    $.each(spiScales, function(index, scale) {
        var output = '<tr>' +
            '<td>' + '<div class="color-block" style="background-color:'+ scale.color +'"></div>' + '</td>';
        if (scale.min === undefined) {
            output += '<td>' + 'less than ' + scale.max + '</td>';
        } else if (scale.max === undefined) {
            output += '<td>' + 'more than ' + scale.min + '</td>';
        } else {
            output += '<td>' + scale.min + ' to ' + scale.max + '</td>';
        }
        output += '<td>' + scale.text + '</td>' +
            '</tr>';

        $('#legend table').append(output);
    });
}
