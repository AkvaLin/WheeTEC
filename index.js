/* -------------------------------------------------------------------------- */
/*                                    Init                                    */
/* -------------------------------------------------------------------------- */

/* --------------------------------- Imports -------------------------------- */

const express = require('express')
const fs = require('fs')
const path = require('path')
const url = require('url')
const ejs = require('ejs')
const mysql = require('mysql2')
const multer = require('multer');
const session = require('express-session')
const { v4: uuidv4 } = require('uuid');

/* ---------------------------------- Setup --------------------------------- */

const app = express()
const port = 3000

const storage = multer.diskStorage({
    destination: path.join(__dirname, 'Resources'),
    filename: (req, file, cb) => {
      cb(null, file.originalname);
    }
});

const upload = multer({ storage: storage })

const jsonParser = express.json();
const urlencodedParser = express.urlencoded({extended: false});

const connection = mysql.createPool({
    host: 'localhost',
    user: 'dbeaver',
    database: 'WheeTEC',
    password: 'dbeaver'
});

app.set('view engine', 'ejs')
app.set('views', 'views')

app.listen(port)

app.use(session({
    secret: 'kitty',
    resave: false,
    saveUninitialized: false,
  }));

/* --------------------------------- Static --------------------------------- */

app.use('/scripts', express.static(path.join(__dirname, 'scripts')))
app.use('/media', express.static(path.join(__dirname, 'Media')))
app.use(express.static(path.join(__dirname, 'Resources')))
app.use(express.static(path.join(__dirname, 'styles')));

/* -------------------------------- Some data ------------------------------- */

let logo
let personImg
let cartImg
let arrowImg

/* -------------------------------------------------------------------------- */
/*                                    HTTP                                    */
/* -------------------------------------------------------------------------- */

/* --------------------------------- Routers -------------------------------- */

app.get('/', (req, res) => {
    res.status(200).render('index', { title: 'Home', logo: logo, personImg: personImg, cartImg: cartImg })
})

app.get('/products', (req, res) => {

    let query = `SELECT * FROM products`

    connection.query(query, function(err, data) {

        if(err) {
            console.log(err);
            res.status(500).render('products', { title: 'Products', logo: logo, personImg: personImg, cartImg: cartImg, products: [] })
            return
        }
        
        res.status(200).render('products', { title: 'Products', logo: logo, personImg: personImg, cartImg: cartImg, products: data })
    });
})

app.get('/support', (req, res) => {

    let query = 'SELECT title, description AS body FROM faq'

    connection.query(query, function(err, data) {
        if (err) {
            res.status(500).render('support', { title: 'Support', logo: logo, personImg: personImg, cartImg: cartImg, faq: [], arrowImg: arrowImg })
            return
        }

        res.status(200).render('support', { title: 'Support', logo: logo, personImg: personImg, cartImg: cartImg, faq: data, arrowImg: arrowImg })
    })
})

app.get('/about', (req, res) => {
    res.status(200).render('about', { title: 'About Us', logo: logo, personImg: personImg, cartImg: cartImg })
})

app.get('/cart', (req, res) => {
    const isLoggedIn = req.session.isLoggedIn;

    if (isLoggedIn) {

        let query = `SELECT c.id, p.name FROM cart c JOIN WheeTEC.products p on p.id = c.product WHERE c.user=${req.session.userId}`

        connection.query(query, function(err, data) {
            if (err) {
                res.status(500).render('cart', { title: 'Cart', logo: logo, personImg: personImg, cartImg: cartImg, cart: [] })
                return
            }

            res.status(200).render('cart', { title: 'Cart', logo: logo, personImg: personImg, cartImg: cartImg, cart: data })
        })
    } else {
        res.status(302).redirect('/login')
    }
})

app.get('/profile', (req, res) => {
    const isLoggedIn = req.session.isLoggedIn;

    if (isLoggedIn) {

        let query = `
        SELECT 
            JSON_ARRAYAGG(p.name) AS name, 
            o.order_id AS id 
        FROM orders o 
        JOIN WheeTEC.products p on p.id = o.product 
        WHERE o.user=${req.session.userId} 
        GROUP BY o.order_id`;

        connection.query(query, function(err, data) {
            if (err) {
                res.status(500).render('profile', { title: 'Profile', logo: logo, personImg: personImg, cartImg: cartImg, orders: [] })
                return
            }

            res.status(200).render('profile', { title: 'Profile', logo: logo, personImg: personImg, cartImg: cartImg, orders: data })
        })
    } else {
        res.status(302).redirect('/login')
    }
})

app.get('/login', (req, res) => {
    const isLoggedIn = req.session.isLoggedIn;

    if (isLoggedIn) {
        res.status(302).redirect('/profile')
    } else {
        res.status(200).render('login', { title: 'Login', logo: logo, personImg: personImg, cartImg: cartImg })
    }
})

app.get('/admin', (req, res) => {
    res.status(200).render('admin', { title: 'Admin' })
})

/* -------------------------------------------------------------------------- */
/*                                  Requests                                  */
/* -------------------------------------------------------------------------- */

/* ----------------------------------- GET ---------------------------------- */

app.get('/get-product', jsonParser, (req,res) => {
    let id = req.query.id

    connection.query(`SELECT * FROM products WHERE id=${id}`, function (err, data) {
        res.setHeader('Content-Type', 'application/json')

        if(err) {
            res.status(500).json({
                success: false
            })
            return
        }

        res.status(200).json({
            success: true,
            data: data
        })
    })
})

app.get('/get-data', jsonParser, (req, res) => {
    if(!req.body) return res.sendStatus(400);
    let table = req.query.table
    connection.query(`SELECT * FROM ${table.toLowerCase()}`, function(err, data) {
        if(err) return console.log(err);
        
        res.setHeader('Content-Type', 'application/json')
        res.status(200).json({
            success: true,
            data: data
        })
    });
})

app.get('/get-columns', jsonParser, (req, res) => {
    if(!req.body) return res.sendStatus(400);
    let table = req.query.table

    let query = `select COLUMN_NAME from information_schema.columns where table_schema = 'WheeTEC' and table_name = '${table.toLowerCase()}'`
    
    res.setHeader('Content-Type', 'application/json')

    connection.query(query, function(err, data) {
        if(err) {
            res.status(200).json({
                success: false
            })
            return
        }
        
        res.status(200).json({
            success: true,
            data: data
        })
    });
})

app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            res.send({success: false})
        } else {
            res.send({success: true})
        }
    });
});

/* ---------------------------------- POST ---------------------------------- */

app.post('/login', urlencodedParser, (req, res) => {
    const login = req.body.login;
    const password = req.body.password;

    let query = `SELECT * FROM users WHERE login='${login}' AND password='${password}'`

    connection.query(query, function(err, data) {

        if(err) {
            console.log(err);
            res.status(500).json({
                success: false
            })
            return
        }
        
        if (data.length > 0) {
            req.session.isLoggedIn = true;
            req.session.userId = data[0]['id'];

            res.send({redirect: '/profile'});
        } else {
            res.send({redirect: '/login', message: 'Wrong credentials'});
        }
    });
});

app.post('/create-user', urlencodedParser, (req, res) => {
    const login = req.body.login;
    const password = req.body.password;

    let query = `INSERT INTO users (login, password) VALUES ('${login}', '${password}')`

    connection.query(query, function(err, data) {

        if(err) {
            res.status(500).json({
                success: false
            })
            return
        }

        query = `SELECT * FROM users WHERE login='${login}' AND password='${password}'`

        connection.query(query, function(err, data) {
            if(err) {
                res.status(500).json({
                    success: false
                })
                return
            }

            if (data.length > 0) {
                req.session.isLoggedIn = true;
                req.session.userId = data[0]['id'];
    
                res.send({redirect: '/profile'});
            } else {
                res.send({redirect: '/login'});
            }
        })
    });
})

app.post('/login-admin', urlencodedParser, (req, res) => {

    if (req.session.isAdminLoggedIn) {
        res.send({success: true, id: req.session.adminId});
        return
    }

    const login = req.body.login;
    const password = req.body.password;

    let query = `SELECT * FROM admins WHERE login='${login}' AND password='${password}'`

    connection.query(query, function(err, data) {

        if(err) {
            console.log(err);
            res.status(500).json({
                success: false
            })
            return
        }
        
        if (data.length > 0) {
            req.session.isAdminLoggedIn = true;
            req.session.adminId = data[0]['id'];
            res.send({success: true, id: req.session.adminId});
        } else {
            res.send({success: false});
        }
    });
});

app.post('/insert-data', urlencodedParser, (req, res) => {

    let table = req.body.table.toLowerCase()
    delete req.body['table']

    let keys = []
    let values = []
    
    for (const [key, value] of Object.entries(req.body)) {
        keys.push(key)
        values.push(`"${value}"`)
    }

    let query = `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${values.join(', ')})`

    handleQuery(query, res)
})

app.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        res.status(400).json({
            success: false,
            message: 'No file uploaded'
        })
        return;
    }

    let table = req.body.table.toLowerCase()
    delete req.body['table']

    let keys = []
    let values = []
    
    for (const [key, value] of Object.entries(req.body)) {
        keys.push(key)
        values.push(`"${value}"`)
    }

    let query = `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${values.join(', ')})`

    handleQuery(query, res) 
});

app.post('/add-cart', urlencodedParser, (req, res) => {

    if (!req.session.isLoggedIn) {
        res.send({ redirect: '/login' })
        return
    }

    let userId = req.session.userId
    let productId = req.body.productId

    let query = `INSERT INTO cart (user, product) VALUES (${userId}, ${productId})`

    handleQuery(query, res)
})

app.post('/order', (req, res) => {

    let userId = req.session.userId

    if (!userId) {
        res.status(500).send({success: false})
        return
    }

    let query = `SELECT * FROM cart WHERE user=${userId}`

    connection.query(query, function(err, data) {
        if (err) {
            res.status(500).send({success: false})
            return
        }

        let values = []

        let uuid = uuidv4()

        data.forEach((part) => {
            values.push(`(${part['user']}, ${part['product']}, '${uuid}')`)
        })

        let orderQuery = `INSERT INTO orders (user, product, order_id) VALUES ${values.join(', ')}`

        connection.query(orderQuery, function(err, response) {
            if (err) {
                res.status(500).send({success: false})
                return
            }

            connection.query(`DELETE FROM cart WHERE user=${userId}`, function(err, result) {
                if (err) {
                    res.status(500).send({success: false})
                    return
                }

                res.status(200).send({success: true})
            })
        })
    })
})

/* ----------------------------------- PUT ---------------------------------- */

app.put('/update-data', urlencodedParser, (req, res) => {
    let table = req.body.table.toLowerCase()
    let id = req.body.id
    delete req.body['table']
    delete req.body['id']

    let data = []

    for (const [key, value] of Object.entries(req.body)) {
        data.push(`${key} = "${value}"`)
    }

    let query = `UPDATE ${table} SET ${data.join(', ')} WHERE id=${id}`

    handleQuery(query, res)
})

app.put('/upload-update', upload.single('file'), (req, res) => {
    let table = req.body.table.toLowerCase()
    let id = req.body.id
    delete req.body['table']
    delete req.body['id']

    let data = []

    for (const [key, value] of Object.entries(req.body)) {
        data.push(`${key} = "${value}"`)
    }

    let query = `UPDATE ${table} SET ${data.join(', ')} WHERE id=${id}`

    handleQuery(query, res)
})

/* --------------------------------- DELETE --------------------------------- */

app.delete('/delete-data', urlencodedParser, (req, res) => {
    let table = req.body.table.toLowerCase()
    let ids = req.body['ids[]']

    let query = `DELETE FROM ${table} WHERE id IN (${ids.join(', ')})`

    handleQuery(query, res)
})

app.delete('/order', urlencodedParser, (req, res) => {
    let query = `DELETE FROM orders WHERE order_id='${req.body.id}'`

    handleQuery(query, res)
})

/* --------------------------------- 404 --------------------------------- */

app.use((req, res) => {
    res.status(404).render('404', { title: 'Not Found', logo: logo, personImg: personImg, cartImg: cartImg })
})

/* -------------------------------------------------------------------------- */
/*                                   Service                                  */
/* -------------------------------------------------------------------------- */

/* ------------------------------- Read files ------------------------------- */

fs.readFile(path.join(__dirname, '/Resources/Media/WheeTec.svg'), function (err, data) {
    if (err) {
        logo = 'WheeTEC'
    } else {
        logo = data
    }
})

fs.readFile(path.join(__dirname, '/Resources/Media/person.svg'), function (err, data) {
    if (err) {
        personImg = 'Profile'
    } else {
        personImg = data
    }
})

fs.readFile(path.join(__dirname, '/Resources/Media/cart.svg'), function (err, data) {
    if (err) {
        cartImg = 'Cart'
    } else {
        cartImg = data
    }
})

fs.readFile(path.join(__dirname, '/Resources/Media/arrow.svg'), function (err, data) {
    if (err) {
        arrowImg = 'Cart'
    } else {
        arrowImg = data
    }
})

/* -------------------------------- Handlers -------------------------------- */

function handleQuery(query, res) {

    res.setHeader('Content-Type', 'application/json')

    connection.query(query, function(err, data) {

        if(err) {
            console.log(err);
            res.status(500).json({
                success: false
            })
            return
        }
        
        res.status(200).json({
            success: true,
        })
    });
}
