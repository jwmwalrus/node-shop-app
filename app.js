import { resolve } from 'path';

import express from 'express';
import expressEjsLayouts from 'express-ejs-layouts';
import { connect } from 'mongoose';

import adminRoutes from './routes/admin.js';
import shopRoutes from './routes/shop.js';
import { errorHandler } from './controllers/errors.js';
import User from './models/user.js';

const dbUrl = 'mongodb://localhost:27017/shop?retryWrites=true&w=majority';

const app = express();

app.use(expressEjsLayouts)
app.set('view engine', 'ejs');
app.set('views', 'views');
app.set('layout', './layouts/main-layout')

app.use(express.urlencoded({ extended: true }));
app.use(express.static(resolve('public')));

app.use((req, res, next) => {
    (async () => {
        try {
            const user = await User.findOne({ email: 'jwm@localhost' });
            req.user = user;
            next();
        } catch (e) {
            console.error(e);
        }
    })();
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorHandler({code: 404, pageTitle: 'Page Not Found'}));

try {
    const client = await connect(MONGODB_URI);
    let user = await User.findOne({ email: 'jwm@localhost' });
    if (user == null) {
        user = new User({ name: 'John M', email: 'jwm@localhost', cart: { items: [] } });
        await user.save();
    }
    app.listen(3000);
} catch (e) {
    console.error(e);
}
