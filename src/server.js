import * as dotenv from 'dotenv';
dotenv.config();
import * as http from 'http';
import express from 'express';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import { engine } from 'express-handlebars';
import mongoose from 'mongoose';
import session from 'express-session';
import passport from 'passport';
import flash from 'connect-flash';
import MongoStore from 'connect-mongo';

import cartRoutes from './routes/index.js';
import userRoutes from './routes/user.js';

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 8080;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

mongoose.connect(process.env.MONGODB_URI);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(
    session({
        store: MongoStore.create({
            mongoUrl: process.env.MONGODB_URI,
            options: {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            },
            ttl: 3600,
        }),
        secret: process.env.MONGODB_SECRET,
        resave: false,
        saveUninitialized: false,
    })
);
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

app.use(express.static(__dirname + '/public'));
app.set('views', __dirname + '/views');
app.set('view engine', 'hbs');

app.engine(
    'hbs',
    engine({
        extname: '.hbs',
        defaultLayout: 'layout.hbs',
        layoutsDir: __dirname + '/views/layouts',
        partialsDir: __dirname + '/views/partials',
    })
);

app.use((req, res, next) => {
    res.locals.login = req.isAuthenticated();
    res.locals.session = req.session;
    next();
});

app.use('/user', userRoutes);
app.use('/', cartRoutes);

app.use((req, res, next) => {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

if (app.get('env') === 'development') {
    app.use((err, req, res, next) => {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err,
        });
    });
}

app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {},
    });
});

server.listen(PORT, () => {
    console.log(`Servidor escuchando en puerto ${PORT}`);
});

server.on('error', (err) => {
    console.error(err);
});
