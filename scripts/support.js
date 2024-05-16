let nameField
let emailField
let messageField
let sendButton

$(function() {
    let faqItems = 
    $('.container__data-faq-item')
        .attr('isExpanded', false)
        .on('click', function() {
            
            let img = $(this).find('.container_data-faq-item-arrow')
            let body = $(this).find('.container_data-faq-item-body')
            let divider = $(this).find('.container_data-faq-item-divider')
            
            if ($(this).attr('isExpanded') === 'false') {
                img.css('transform', 'rotate(90deg)')
                $(this).attr('isExpanded', true)
                body.slideDown()
                divider.slideDown()
            } else {
                img.css('transform', 'rotate(0deg)')
                $(this).attr('isExpanded', false)
                body.slideUp()
                divider.slideUp()
            }
        })

    faqItems.find('.container_data-faq-item-body').hide()
    faqItems.find('.container_data-faq-item-divider').hide()

    nameField = $('#nameField').on('input', checkFields)
    emailField = $('#emailField').on('input', checkFields)
    messageField = $('#messageField').on('input', checkFields)

    sendButton = $('.container__data-contact-from-button')
        .on('click', function() {

            if (nameField.val() && emailField.val() && messageField.val()) {
                $.ajax({
                    url: '/insert-data',
                    method: 'POST',
                    dataType: 'JSON',
                    data: {
                        table: 'support',
                        name: nameField.val(),
                        email: emailField.val(),
                        message: messageField.val()
                    },
                    success: function(response) {
                        // TODO: create handler
                        if (response['success']) {
                            nameField.val('')
                            emailField.val('')
                            messageField.val('')
                            alert('The message was successfully sent')
                        }
                    }
                })

                nameField.val('')
                emailField.val('')
                messageField.val('')

                $(this).prop('disabled', true)
            } else {
                alert('Fill out fields')
            }
        })
        .prop('disabled', true)
    
})

function checkFields() {
    if (nameField.val() && emailField.val() && messageField.val()) {
        sendButton.removeAttr('disabled')
    } else {
        sendButton.prop('disabled', true)
    }
}