let loginField
let passwordField
let signInButton
let dataTable
let dataForm
let category
let dataContainer
let login
let nav

$(function() {
    dataTable = $('#data__table')
    dataForm = $('#data__form')
    loginField = $('#loginField')
    passwordField = $('#passwordField')
    signInButton = $('#signInButton')
    signInButton.prop('disabled', true)
    category = $('#category')
    dataContainer = $('#data__container')

    loginField.on('input', checkFields)
    passwordField.on('input', checkFields)

    login = $('#login')
    nav = $('#nav')

    let action = $('#action')
    let exitButton = $('#exit-button')
    let categoryReturn = $('#category-return')
    let showButton = $("input[value='Show']")
    let addButton = $("input[value='Add']")
    let updateButton = $("input[value='Update']")
    let deleteButton = $("input[value='Delete']")

    let data = $('#data')
    let dataReturn = $('#data-return')

    login.hide()
    nav.hide()
    data.hide()
    action.hide()

    signIn()

    nav.find('.button').on('click', function() {
        let title = $(this).val()
        category.html(title)
        nav.hide()
        action.show()

        if (title === 'Support' || title === 'Orders') {
            addButton.hide()
            updateButton.hide()
            deleteButton.hide()
        }
    })

    categoryReturn.on('click', function() {

        let title = category.html()

        category.html('')
        action.hide()
        nav.show()

        if (title === 'Support' || title === 'Orders') {
            addButton.show()
            updateButton.show()
            deleteButton.show()
        }
    })

    dataReturn.on('click', function() {
        dataTable.html('')
        dataForm.html('')
        dataContainer.html('')
        action.show()
        data.hide()
    })

    showButton.on('click', function() {
        let table = category.html()

        getData(table, createTable)

        action.hide()
        data.show()
    })

    addButton.on('click', function() {
        let table = category.html()

        createInsertForm(table)

        action.hide()
        data.show()
    })

    updateButton.on('click', function() {
        let table = category.html()

        getData(table, createUpdateForm)

        action.hide()
        data.show()
    })

    deleteButton.on('click', function() {
        let table = category.html()

        getData(table, createDeleteForm)

        action.hide()
        data.show()
    })

    signInButton.on('click', function() {
        signIn()
    })

    exitButton.on('click', function() {
        $.ajax({
            url: '/logout',
            method: 'GET',
            dataType: 'JSON',
            success: function(response) {
                if (response.success) {
                    signIn()
                }
            }
        })
    })
})

function checkFields() {
    if (loginField.val() && passwordField.val()) {
        signInButton.removeAttr('disabled')
    } else {
        signInButton.prop('disabled', true)
    }
}

function signIn() {
    $.ajax({
        url: '/login-admin',
        method: 'POST',
        dataType: 'JSON',
        data: {
            login: loginField.val(),
            password: passwordField.val()
        },
        success: function(response) {

            loginField.val('')
            passwordField.val('')

            if (response.success) {
                login.hide()
                nav.show()
            } else {
                nav.hide()
                login.show()
            }

        }
    })
}

function getData(table, handler) {
    $.ajax({
        url: '/get-data',
        method: 'GET',
        dataType: 'JSON',
        data: {
            table: table
        },
        success: function(response) {
            // TODO: create handler
            handler(response)
        }
    })
}

function createTable(response) {
    if (response['success']) {
        let json = response['data']
        if (json.length > 0) {
            let cols = Object.keys(json[0]);
    
            let headerRow = cols
                .map(col => `<th>${col}</th>`)
                .join("");
        
            let rows = json
                .map(row => {
                    let tds = cols.map(col => `<td>${row[col]}</td>`).join("");
                    return `<tr>${tds}</tr>`;
                })
                .join("");
    
            const table = `
                    <thead>
                        <tr>${headerRow}</tr>
                    <thead>
                    <tbody>
                        ${rows}
                    <tbody>`;
    
            dataTable.html(`${table}`)
        }
        else {
            dataTable.html('<th>Empty</th>')
        }
    }
}

function createUpdateForm(response) {
    if (response['success']) {
        let json = response['data']

        if (json.length <= 0) {
            dataTable.html('<th>Empty</th>')
            return
        }

        for (let i = 0; i < json.length; i++) {
            const element = json[i];
            
            let div = $('<div>')
                .addClass('container__data-update-item')

            let form = $('<form>')
            div.append(form)
            
            for (const [key, value] of Object.entries(element)) {

                if (key == 'id') {
                    continue
                }

                let inputField = $('<input>')
                                    .addClass('container__data-contact-from-input')
                                    .addClass('container__data-form-input-field-to-check')
                                    .attr('type', 
                                        (key !== 'image' && key !== 'filename') ? 'text' : 'file')
                                    .attr('placeholder', key)
                                    .attr('name', key)
                                    .on('input', function() {
                                        checkButton($(this))
                                    })
                
                if (key !== 'image' && key !== 'filename') {
                    inputField.val(value)
                }

                form.append(inputField)
            }

            form.append(
                $('<input>')
                    .addClass('button')
                    .attr('type', 'button')
                    .val('Update')
                    .addClass('performButton')
                    .on('click', function() {
                        let data = form.serializeArray().reduce(function(obj, item) {
                            obj[item.name] = item.value;
                            return obj;
                        }, {});
                        data['id'] = element['id']
                        let input = div.find('input[type="file"]')
                        updateData(data, input)
                        $(this).prop('disabled', true)
                    })
                    .prop('disabled', true)
            )

            dataContainer.append(div)
        }
    }
}

function createDeleteForm(response) {
    if (response['success']) {
        let json = response['data']
        if (json.length > 0) {
            let cols = Object.keys(json[0]);
    
            let headerRow = cols
                .map(col => `<th>${col}</th>`)
                .join("");

            headerRow += '<th></th>'
        
            let rows = json
                .map(row => {
                    let tds = cols.map(col => `<td>${row[col]}</td>`).join("");
                    tds += `<td>                                    
                                <input type="checkbox" class="custom-checkbox" id=${row["id"]} name=${row["id"]} value="yes">
                                <label for=${row["id"]}></label>
                            </td>`
                    return `<tr class=${row["id"]}>${tds}</tr>`;
                })
                .join("");
    
            const table = `
                    <thead>
                        <tr>${headerRow}</tr>
                    <thead>
                    <tbody>
                        ${rows}
                    <tbody>`;
            
            dataTable.html(`${table}`)
            dataForm.append(
                $('<input>')
                    .addClass('button')
                    .attr('type', 'button')
                    .val('Delete')
                    .addClass('performButton')
                    .on('click', function() {
                        let inputs = $('input:checked');
                        let ids = []
                        inputs.each((index, checkbox) => {
                            ids.push($(checkbox).attr('id'));
                        })
                        deleteData(ids)
                    })
                    .prop('disabled', true)
            )
            $('input[type="checkbox"]').on('change', checkDeleteButton)
        }
        else {
            dataTable.html('<th>Empty</th>')
        }
    }
}

function createInsertForm(table) {
    $.ajax({
        url: '/get-columns',
        method: 'GET',
        dataType: 'JSON',
        data: {
            table: table
        },
        success: function(response) {
            if (response['success']) {
                let json = response['data']
                json.forEach(element => {
                    if (element['COLUMN_NAME'] != 'id') {
                        dataForm.append(
                            $('<input>')
                                .addClass('container__data-contact-from-input')
                                .addClass('container__data-form-input-field-to-check')
                                .attr('type', 
                                (element['COLUMN_NAME'] !== 'image' && element['COLUMN_NAME'] !== 'filename') ? 'text' : 'file')
                                .attr('placeholder', `${element['COLUMN_NAME']}`)
                                .attr('name', `${element['COLUMN_NAME']}`)
                                .on('input', function() {
                                    checkButton($(this))
                                })
                        )
                    }
                });
                dataForm.append(
                    $('<input>')
                        .addClass('button')
                        .attr('type', 'button')
                        .val('Add data')
                        .addClass('performButton')
                        .on('click', function() {
                            insertData()
                            $(this).prop('disabled', true)
                        })
                        .prop('disabled', true)
                )
            }
        }
    })
}

function insertData() {
    let data = dataForm.serializeArray().reduce(function(obj, item) {
        obj[item.name] = item.value;
        return obj;
    }, {});
    data['table'] = category.html()
    
    let input = $('input[type="file"]')
    if (input['length'] != 0) {
        let file = input.prop('files')[0]
        let filename = file['name']
        let target = input.attr('name')
        data[target] = filename

        let formData = new FormData()
        formData.append('file', file)
        
        for (const [key, value] of Object.entries(data)) {
            formData.append(key, value)
        }

        $.ajax({
            method: "POST",
            url: "/upload",
            data: formData,
            processData: false,
            contentType: false,
            success: function(response) {
                if (response.success) {
                    alert("Success")
                    clearFields()
                } else {
                    alert("Fail")
                }
            }
        });
        return;
    }

    $.ajax({
        url: '/insert-data',
        method: 'POST',
        dataType: 'JSON',
        data: data,
        success: function(response) {
            if (response.success) {
                alert("Success")
                clearFields()
            } else {
                alert("Fail")
            }
        }
    })
}

function updateData(data, input) {
    data['table'] = category.html()
     
    if (input['length'] != 0) {
        let file = input.prop('files')[0]
        let filename = file['name']
        let target = input.attr('name')
        data[target] = filename

        let formData = new FormData()
        formData.append('file', file)
        
        for (const [key, value] of Object.entries(data)) {
            formData.append(key, value)
        }

        $.ajax({
            method: "PUT",
            url: "/upload-update",
            data: formData,
            processData: false,
            contentType: false,
            success: function(response) {
                if (response.success) {
                    alert("Success")
                } else {
                    alert("Fail")
                }
            }
        });
        return;
    }

    $.ajax({
        url: '/update-data',
        method: 'PUT',
        dataType: 'JSON',
        data: data,
        success: function(response) {
            if (response.success) {
                alert("Success")
            } else {
                alert("Fail")
            }
        }
    })
}

function deleteData(ids) {

    let table = category.html()

    if (ids.length == 1) {
        ids = [ids[0], ids[0]]
    }

    $.ajax({
        url: '/delete-data',
        method: 'DELETE',
        dataType: 'JSON',
        data: {
            ids: ids,
            table: table
        },
        success: function(response) {
            if (response.success) {
                ids.forEach( (id) => {
                    $(`tr[class*=${id}]`).remove()
                })
                alert("Success")
            } else {
                alert("Fail")
            }
            checkDeleteButton()
        }
    })
}

function checkButton(self) {
    let button = self.parent().find('.performButton')
    button.removeAttr('disabled')

    $('.container__data-form-input-field-to-check').each(function(index, value) {
        if ($(value).attr['file']) {
            if (!$(value).file) {
                button.prop('disabled', true)
            }
        } else {
            if (!$(value).val()) {
                button.prop('disabled', true)
            }
        }
    })
}

function checkDeleteButton() {
    let button = $('.performButton')

    if ($('input:checked').length > 0) {
        button.removeAttr('disabled')
    } else {
        button.prop('disabled', true)
    }
}

function clearFields() {
    $('.container__data-form-input-field-to-check').val('')
}
