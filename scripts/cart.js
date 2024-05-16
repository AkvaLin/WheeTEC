let button

$(function() {

    button = $('#order')

    checkButton()

    $('.remove').on('click', function() {
        remove($(this).attr('id'))
    })

    button.on('click', order)
})

function remove(id) {
    $.ajax({
        url: '/delete-data',
        method: 'DELETE',
        dataType: 'JSON',
        data: {
            ids: [id, id],
            table: 'cart'
        },
        success: function(response) {
            if (response.success) {
                $(`.${id}`).remove()
                checkButton()
            }
        }
    })
}

function checkButton() {
    if ($('li').length == 0) {
        button.hide()
    } else {
        button.show()
    }
}

function order() {
    $.ajax({
        url: '/order',
        method: 'POST',
        dataType: 'JSON',
        success: function(response) {
            if (response.success) {
                window.location = '/profile'
            }
        }
    })
}
