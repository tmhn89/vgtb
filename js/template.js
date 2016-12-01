$(function(){
    $('.template').load('template.html', function() {
        // move content to content-wrap
        $('.content').appendTo('.content-wrap');
        $.each($('.leftnav a'), function(index, a) {
            if ($.inArray($(a).attr('page'), currentPage) >= 0) {
                $(a).parent().addClass('active');
            }
        })
    });

    $('.leftnav a').on('click', function() {
        console.log($(this).attr('page'));
        //$('#content').load("content.html");
    });
});
