$(function() {
    $('.cancel').on('click', function() {
        let parent = $(this).parent()
        $.ajax({
            url: '/order',
            method: 'DELETE',
            dataType: 'JSON',
            data: {
                id: $(this).attr('id')
            },
            success: function(response) {
                if (response.success) {
                    parent.remove()
                }
            }
        })
    })
})