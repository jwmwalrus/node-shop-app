import { resolve, join } from 'path';
import { createWriteStream } from 'fs';
import { readFile } from 'fs/promises';
import { createServer } from 'http';
// import { createServer } from 'https';

import express from 'express';
import cookieParser from 'cookie-parser';
import expressEjsLayouts from 'express-ejs-layouts';
import session from 'express-session';
import flash from 'flash';
import multer from 'multer';
import compression from 'compression';

import csurf from 'tiny-csrf';
import 'dotenv/config';
import { connect } from 'mongoose';
import ConnectMongoDb from 'connect-mongodb-session';
import helmet from 'helmet';
import morgan from 'morgan';

import adminRoutes from './routes/admin.js';
import shopRoutes from './routes/shop.js';
import authRoutes from './routes/auth.js';
import { AppError, renderError } from './middleware/errors.js';
import User from './models/user.js';

const MongoDbStore = ConnectMongoDb(session);

const app = express();

// const privateKey = await readFile(join(resolve('certs'), 'server.key'));
// const certificate = await readFile(join(resolve('certs'), 'server.cert'));

const store = new MongoDbStore({
    uri: process.env.MONGODB_URI,
    collection: 'sessions',
});

const storageEngine = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './public/images');
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    },
});

const fileFilter = (req, file, cb) => {
    cb(null, ['image/png', 'image/jpg', 'image/jpeg'].includes(file.mimetype));
};

app.use(helmet());
app.use(compression());

const accessLogStream = createWriteStream(join(resolve('.'), 'access.log'), {
    flags: 'a',
});
app.use(morgan('combined', { stream: accessLogStream }));

// template
app.use(expressEjsLayouts);
app.set('view engine', 'ejs');
app.set('views', 'views');
app.set('layout', './layouts/main-layout');

// forms
app.use(express.urlencoded({ extended: false }));
// FIXME: The storage engine doesn't seem to work
app.use(multer({ storage: storageEngine, fileFilter }).single('image'));
// app.use(multer({ dest: './public/images' }).single('image'));
app.use(express.static(resolve('public')));

// session
app.use(cookieParser('cookie-parser-secret'));
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        store,
    }),
);
app.use(csurf(process.env.CSRF_SECRET));
app.use(flash());

// make some variables available to all templates
app.use((req, res, next) => {
    res.locals.originalUrl = req.originalUrl;
    res.locals.isAuthenticated = req.session?.isAuthenticated;
    res.locals.csrfToken = req.csrfToken ? req.csrfToken() : '';
    next();
});

// add up-to-date session user to all requests
app.use((req, res, next) => {
    (async () => {
        try {
            if (req.session && req.session.user) {
                const user = await User.findById(req.session.user._id);
                if (!user) {
                    throw new Error('No user exists for the given session');
                }

                req.user = user;
            }
            next();
        } catch (e) {
            console.error(e);
        }
    })();
});

// routes
app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

// catch
app.use((req, res) => renderError(res, 'Page Not Found', 404));
app.use((error, req, res) => {
    if (error.render) {
        return error.render(res);
    }

    const e = new AppError('Error', { cause: error });
    e.render(res);
});

try {
    await connect(process.env.MONGODB_URI);
    // const server = createServer({ key: privateKey, cert: certificate }, app);
    const server = createServer(app);
    server.listen(process.env.PORT || 3000);
} catch (e) {
    console.error(e);
}
