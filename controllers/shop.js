import Product from '../models/product.js';

import { renderError } from './errors.js';

export const getIndex = (req, res, next) => {
    (async () => {
        let products = [];
        try {
            products = await Product.fetchSome();
        } catch (e) {
            console.error(e);
        }
        res.render('shop/index', { prods: products, pageTitle: 'Index', path: req.originalUrl });
    })();
};

export const getProducts = (req, res, next) => {
    (async () => {
        let products = [];
        try {
            products = await Product.fetchAll();
        } catch (e) {
            console.error(e);
        }
        res.render('shop/product-list', { prods: products, pageTitle: 'Shop', path: req.originalUrl });
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

        res.render('shop/product-detail', { product: product, pageTitle: product.title, path: '/products' });
    })();
};

export const getCart = (req, res, next) => {
    (async () => {
        const cart = await req.user.getCart();

        res.render('shop/cart', { prods: cart.items, pageTitle: 'Your Cart', path: req.originalUrl });
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
            orders = await req.user.getOrders();
        } catch (e) {
            console.error(e);
        }
        res.render('shop/orders', { orders, pageTitle: 'Orders', path: req.originalUrl });
    })();
};

export const postOrder = (req, res, next) => {
    (async () => {
        try {
            const order = await req.user.addOrder();

            if (order.items.length == 0) {
                res.redirect('/cart');
                return
            }
        } catch (e) {
            console.error(e);
        }

        res.redirect('/orders');
    })();
};

export const getCheckout = (req, res, next) => {
    res.render('shop/checkout', { pageTitle: 'Checkout', path: req.originalUrl });
};

