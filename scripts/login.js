let loginField
let passwordField
let secondPasswordField
let firstButton
let secondButton
let isLogin = true

$(function() {
    loginField = $('#loginField')
    passwordField = $('#passwordField')
    secondPasswordField = $('#secondPasswordField')
    secondPasswordField.hide()

    firstButton = $('#firstButton')
    secondButton = $('#secondButton')

    firstButton.prop('disabled', true)

    secondButton.on('click', function() {
        isLogin = !isLogin
        firstButton.prop('disabled', true)

        let firstButtonValue = firstButton.val()
        firstButton.val(secondButton.val())
        secondButton.val(firstButtonValue)

        loginField.val('')
        passwordField.val('')
        secondPasswordField.val('')

        if (isLogin) {
            secondPasswordField.hide()
        } else {
            secondPasswordField.show()
        }
    })

    loginField.on('input', checkFields)
    passwordField.on('input', checkFields)
    secondPasswordField.on('input', checkFields)

    firstButton.on('click', function() {

        if (loginField.val() && passwordField.val() && (secondPasswordField.val() || isLogin)) {

            if (!isLogin && (passwordField.val() !== secondPasswordField.val())) {
                alert("Passwords don't matched")
                return
            }
            
            $.ajax({
                url: isLogin ? '/login' : '/create-user',
                method: 'POST',
                dataType: 'JSON',
                data: {
                    login: loginField.val(),
                    password: passwordField.val()
                },
                success: function(response) {
                    // TODO: create handler
                    if (response.message) {
                        alert(response.message)
                    }

                    if (response.redirect) { 
                        window.location = response.redirect
                    }
                }
            })

            loginField.val('')
            passwordField.val('')
            secondPasswordField.val('')
        } else {
            alert('Fill out fields')
        }
    })
})

function checkFields() {
    if (loginField.val() && passwordField.val() && (secondPasswordField.val() || isLogin)) {
        firstButton.removeAttr('disabled')
    } else {
        firstButton.prop('disabled', true)
    }
}
