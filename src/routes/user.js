import * as dotenv from 'dotenv';
dotenv.config();
import { Router } from 'express';
import csrf from 'tiny-csrf';
import passport from 'passport';

import orderService from '../models/order.js';
import { Cart } from '../models/cart.js';

const router = Router();
// const csrfProtection = csrf(process.env.SECRET);
// router.use(csrfProtection);

router.get('/profile', isLoggedIn, (req, res, next) => {
    orderService.find({ user: req.user }, (err, orders) => {
        if (err) {
            return res.write('Error!');
        }
        let cart;
        orders.forEach(function (order) {
            cart = new Cart(order.cart);
            order.items = cart.generateArray();
        });
        res.render('user/profile', { orders: orders });
    });
});

router.get('/logout', isLoggedIn, (req, res, next) => {
    req.logout();
    res.redirect('/');
});

router.use('/', notLoggedIn, (req, res, next) => {
    next();
});

router.get('/signup', (req, res, next) => {
    var messages = req.flash('error');
    res.render('user/signup', {
        // csrfToken: req.csrfToken(),
        messages: messages,
        hasErrors: messages.length > 0,
    });
});

router.post(
    '/signup',
    passport.authenticate('local.signup', {
        failureRedirect: '/user/signup',
        failureFlash: true,
    }),
    (req, res, next) => {
        if (req.session.oldUrl) {
            var oldUrl = req.session.oldUrl;
            req.session.oldUrl = null;
            res.redirect(oldUrl);
        } else {
            res.redirect('/user/profile');
        }
    }
);

router.get('/signin', (req, res, next) => {
    var messages = req.flash('error');
    res.render('user/signin', {
        // csrfToken: req.csrfToken(),
        messages: messages,
        hasErrors: messages.length > 0,
    });
});

router.post(
    '/signin',
    passport.authenticate('local.singin', {
        failureRedirect: '/user/signin',
        failureFlash: true,
    }),
    (req, res, next) => {
        if (req.session.oldUrl) {
            var oldUrl = req.session.oldUrl;
            req.session.oldUrl = null;
            res.redirect(oldUrl);
        } else {
            res.redirect('/user/profile');
        }
    }
);

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/');
}

function notLoggedIn(req, res, next) {
    if (!req.isAuthenticated()) {
        return next();
    }
    res.redirect('/');
}

export default router;
