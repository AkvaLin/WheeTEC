let product
let success
let title
let image
let price
let addButton
let description

$(function() {
    product = document.getElementById("product")
    success = document.getElementById("success")
    title = $('#product_title')
    image = $('#product_image')
    price = $('#product_price')
    addButton = $('#product_cart')
    description = $('#product_description')

    $('#close').on('click', function() {
        product.close()
    })

    $('#continue').on('click', function() {
        success.close()
        product.close()
    })

    $('#cart').on('click', function() {
        window.location = '/cart'
    })

    addButton.on('click', function() {
        addToCart($(this).attr('productId'))
    })

    $('.container__data-products-item').on('click', function() {
        product.showModal()
        
        let id = $(this).attr('id')
        getDataForCard(id)
    })

    $('select').on('change', function() {
        switch ($(this).val()) {
            case 'formula':
                $('.container__data-products-item').hide()
                $('div[type="formula"]').show()
                break;
            case 'gt':
                $('.container__data-products-item').hide()
                $('div[type="gt"]').show()
                break;
            default:
                $('.container__data-products-item').show()
                break;
        }
    })
})

function getDataForCard(id) {
    $.ajax({
        url: '/get-product',
        method: 'GET',
        dataType: 'JSON',
        data: {
            id: id
        },
        success: function(response) {
            if (response.success) {
                let data = response.data[0]

                addButton.attr('productId', data.id)
                title.html(data.name)
                image.attr('src', data.image)
                price.html(data.price + '$')
                description.html(data.description)
            } else {
                product.close()
            }
        }
    })
}

function addToCart(id) {
    $.ajax({
        url: '/add-cart',
        method: 'POST',
        dataType: 'JSON',
        data: {
            productId: id
        },
        success: function(response) {

            console.log(response);

            if (response.redirect) { 
                window.location = response.redirect
                return
            }

            if (response.success) {
                success.showModal()
            }
        },
        error: function(err) {
            console.log(err);
        }
    })
}
