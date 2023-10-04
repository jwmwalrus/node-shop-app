import Product from '../models/product.js';
import Order from '../models/order.js';

import { renderError } from './errors.js';

export const getIndex = (req, res, next) => {
    (async () => {
        let products = [];
        try {
            products = await Product.find();
        } catch (e) {
            console.error(e);
        }
        res.render('shop/index', { prods: products, pageTitle: 'Index' });
    })();
};

export const getProducts = (req, res, next) => {
    (async () => {
        let products = [];
        try {
            products = await Product.find();
        } catch (e) {
            console.error(e);
        }
        res.render('shop/product-list', { prods: products, pageTitle: 'Shop' });
    })();
};

export const getProduct = (req, res, next) => {
    (async () => {
        let product;
        try {
            product = await Product.findById(req.params.productId);
        } catch (e) {
            renderError(res, 404, e.message);
            return
        }

        res.render('shop/product-detail', { product: product, pageTitle: product.title });
    })();
};

export const getCart = (req, res, next) => {
    (async () => {
        const user = await req.user.populate({ path: 'cart.items.product' });

        res.render('shop/cart', { prods: user.cart.items, pageTitle: 'Your Cart' });
    })();
};

export const postCart = (req, res, next) => {
    const { productId } = req.body;
    if (productId == null) {
        return renderError(res)
    }

    (async () => {
        try {
            const product = await Product.findById(productId);
            await req.user.addToCart(product);
        } catch (e) {
            return renderError(res, 404, e.message);
        }

        res.redirect('/cart');
    })();
};

export const postCartDeleteProduct = (req, res, next) => {
    const { productId } = req.body;
    if (productId == null) {
        return renderError(res)
    }

    (async () => {
        try {
            await req.user.removeFromCart(productId);
        } catch (e) {
            return renderError(res, 404, e.message);
        }

        res.redirect('/cart');
    })();
}

export const getOrders = (req, res, next) => {
    (async () => {
        let orders = [];
        try {
            orders = await Order.find({ user: req.user });
        } catch (e) {
            console.error(e);
        }
        res.render('shop/orders', { orders, pageTitle: 'Orders' });
    })();
};

export const postOrder = (req, res, next) => {
    (async () => {
        try {
            const user = await req.user.populate('cart.items.product');
            const order = new Order({items: user.cart.items, user: req.user});

            if (order.items.length == 0) {
                res.redirect('/cart');
                return
            }

            await order.save();

            req.user.cart = { items: [] };
            await req.user.save();
        } catch (e) {
            console.error(e);
        }

        res.redirect('/orders');
    })();
};

export const getCheckout = (req, res, next) => {
    res.render('shop/checkout', { pageTitle: 'Checkout' });
};

