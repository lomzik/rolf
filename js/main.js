$(document).ready(function(){
    $('#danger-button').click(function(){
        $('#services_additional').toggle();
        $('#services_block').toggle();
        $(this).toggleClass('active');
    });
});