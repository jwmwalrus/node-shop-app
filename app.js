import { resolve } from 'path';

import 'dotenv/config';
import express from 'express';
import expressEjsLayouts from 'express-ejs-layouts';
import { connect } from 'mongoose';
import ConnectMongoDb from 'connect-mongodb-session';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import csurf from 'tiny-csrf';
import flash from 'flash';

import adminRoutes from './routes/admin.js';
import shopRoutes from './routes/shop.js';
import authRoutes from './routes/auth.js';
import { AppError, renderError } from './middleware/errors.js';
import User from './models/user.js';

const MongoDbStore = ConnectMongoDb(session);

const app = express();
const store = new MongoDbStore({
    uri: process.env.MONGODB_URI,
    collection: 'sessions',
});

app.use(expressEjsLayouts)
app.set('view engine', 'ejs');
app.set('views', 'views');
app.set('layout', './layouts/main-layout')

app.use(express.urlencoded({ extended: true }));
app.use(express.static(resolve('public')));
app.use(cookieParser("cookie-parser-secret"));
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store,
}));

app.use(csurf(process.env.CSRF_SECRET));
app.use(flash());

// middleware to make some variables available to all templates
app.use((req, res, next) => {
    res.locals.originalUrl = req.originalUrl;
    res.locals.isAuthenticated = req.session.isAuthenticated ? true : false;
    res.locals.csrfToken = req.csrfToken ? req.csrfToken() : '';
    next();
});

app.use((req, res, next) => {
    (async () => {
        try {
            if (req.session && req.session.user) {
                const user = await User.findById(req.session.user._id);
                if (!user) {
                    throw new Error("No user exists for the given session");
                }

                req.user = user;
            }
            next();
        } catch (e) {
            console.error(e);
        }
    })();
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use((req, res, next) => renderError(res, 'Page Not Found', 404));
app.use((error, req, res, next) => {
    if (error.render) {
        return error.render(res);
    }

    const e = new AppError('Error', { cause: error });
    e.render(res);
});

try {
    await connect(process.env.MONGODB_URI);
    app.listen(3000);
} catch (e) {
    console.error(e);
}
