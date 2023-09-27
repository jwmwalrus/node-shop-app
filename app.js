import { resolve } from 'path';

import express from 'express';
import expressEjsLayouts from 'express-ejs-layouts';

import adminRoutes from './routes/admin.js';
import shopRoutes from './routes/shop.js';
import { errorHandler } from './controllers/errors.js';
import { mongoConnect } from './util/database.js';
import User from './models/user.js';

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
            const user = await User.findByEmail('jwm@localhost');
            req.user = new User(user._id.toString(), user.name, user.email, user.cart);
            next();
        } catch (e) {
            console.error(e);
        }
    })();
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorHandler({code: 404, pageTitle: 'Page Not Found'}));


try {
    const client = await mongoConnect()
    let user = await User.findByEmail('jwm@localhost')
    if (user == null) {
        user = new User(null, 'John M','jwm@localhost', { items: [] })
        await user.save();
    }
    app.listen(3000);
} catch (e) {
    console.error(e);
}
