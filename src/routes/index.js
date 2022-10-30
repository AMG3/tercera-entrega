import { Router } from 'express';
import { Cart } from '../models/cart.js';

import productService from '../models/product.js';
import orderService from '../models/order.js';

const router = Router();

/* GET home page. */
router.get('/', (req, res, next) => {
    const successMsg = req.flash('success')[0];
    productService.find((err, docs) => {
        const productChunks = [];
        const chunkSize = 3;
        for (let i = 0; i < docs.length; i += chunkSize) {
            productChunks.push(docs.slice(i, i + chunkSize));
        }
        res.render('shop/index', {
            title: 'E-commerce',
            products: productChunks,
            successMsg: successMsg,
            noMessages: !successMsg,
        });
    });
});

router.get('/add-to-cart/:id', (req, res, next) => {
    const productId = req.params.id;
    const cart = new Cart(req.session.cart ? req.session.cart : {});

    productService.findById(productId, (err, product) => {
        if (err) {
            return res.redirect('/');
        }
        cart.add(product, product.id);
        req.session.cart = cart;
        console.log(req.session.cart);
        res.redirect('/');
    });
});

router.get('/reduce/:id', function (req, res, next) {
    const productId = req.params.id;
    const cart = new Cart(req.session.cart ? req.session.cart : {});

    cart.reduceByOne(productId);
    req.session.cart = cart;
    res.redirect('/shopping-cart');
});

router.get('/remove/:id', function (req, res, next) {
    const productId = req.params.id;
    const cart = new Cart(req.session.cart ? req.session.cart : {});

    cart.removeItem(productId);
    req.session.cart = cart;
    res.redirect('/shopping-cart');
});

router.get('/shopping-cart', function (req, res, next) {
    if (!req.session.cart) {
        return res.render('shop/shopping-cart', { products: null });
    }
    const cart = new Cart(req.session.cart);
    res.render('shop/shopping-cart', {
        products: cart.generateArray(),
        totalPrice: cart.totalPrice,
    });
});

router.get('/checkout', isLoggedIn, function (req, res, next) {
    if (!req.session.cart) {
        return res.redirect('/shopping-cart');
    }
    const cart = new Cart(req.session.cart);
    const errMsg = req.flash('error')[0];
    res.render('shop/checkout', {
        total: cart.totalPrice,
        errMsg: errMsg,
        noError: !errMsg,
    });
});

router.post('/checkout', isLoggedIn, function (req, res, next) {
    if (!req.session.cart) {
        return res.redirect('/shopping-cart');
    }
    const cart = new Cart(req.session.cart);

    // TODO enviar correo con los productos y limpiar el carro y quitar stripe
    // ejemplo: sendEmail('anais6622@hotmail.com', 'Hola', 'Hola amor');

    const stripe = require('stripe')('sk_test_fwmVPdJfpkmwlQRedXec5IxR');

    stripe.charges.create(
        {
            amount: cart.totalPrice * 100,
            currency: 'usd',
            source: req.body.stripeToken, // obtained with Stripe.js
            description: 'Test Charge',
        },
        function (err, charge) {
            if (err) {
                req.flash('error', err.message);
                return res.redirect('/checkout');
            }
            const order = new orderService({
                user: req.user,
                cart: cart,
                address: req.body.address,
                name: req.body.name,
                paymentId: charge.id,
            });
            orderService.save(function (err, result) {
                req.flash('success', 'Successfully bought product!');
                req.session.cart = null;
                res.redirect('/');
            });
        }
    );
});

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    req.session.oldUrl = req.url;
    res.redirect('/user/signin');
}

export default router;
