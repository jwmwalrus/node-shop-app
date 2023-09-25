import { resolve } from 'path';

import express from 'express';
import expressEjsLayouts from 'express-ejs-layouts';

import adminRoutes from './routes/admin.js';
import shopRoutes from './routes/shop.js';
import { errorHandler } from './controllers/errors.js';
import sequelize from './util/database.js';
import Product from './models/product.js';
import User from './models/user.js';
import Cart from './models/cart.js';
import CartItem from './models/cart-item.js';
import Order from './models/order.js';
import OrderItem from './models/order-item.js';

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
            const user = await User.findByPk(1);
            req.user = user;
            next();
        } catch (e) {
            console.error(e);
        }
    })();
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorHandler({code: 404, pageTitle: 'Page Not Found'}));

Product.belongsTo(User, {  constraints: true, onDelete: 'CASCADE' });
User.hasMany(Product);
User.hasOne(Cart);
Cart.belongsTo(User);
Cart.belongsToMany(Product, { through: CartItem });
Product.belongsToMany(Cart, { through: CartItem });
Order.belongsTo(User);
User.hasMany(Order);
Order.belongsToMany(Product, { through: OrderItem })


try {
    // await sequelize.sync({ force: true })
    await sequelize.sync()
    let user = await User.findByPk(1)
    if (user == null) {
        user = await User.create({name: 'John M', email: 'jwm@localhost'})
        await user.createCart();
    }
    app.listen(3000);
} catch (e) {
    console.error(e);
}
