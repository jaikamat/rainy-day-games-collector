$(document).ready(() => {
    $('#card-button').click(() => {
        let url = window.location.origin;
        $('#card-button').prop('disabled', true);
        $('.loader').css('visibility', 'visible')
        $.when($.get(url + '/cards'))
        .then((cards) => {
            $("#result").html(cards);
            $('#card-button').prop('disabled', false);            
            $('.loader').css('visibility', 'hidden')
        }).catch((err) => {
            alert(err);
        })
    })
})
