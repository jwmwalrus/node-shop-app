import Product from '../models/product.js';
import Cart from '../models/cart.js';

import { renderError } from './errors.js';

export const getIndex = (req, res, next) => {
    res.render('shop/index', { pageTitle: 'Index', path: req.originalUrl });
};

export const getProducts = (req, res, next) => {
    (async () => {
        const products = await Product.fetchAll();
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
        const cart = await Cart.getCart();
        const products = await Product.fetchAll();

        const prods = [];
        for (let c of cart.products) {
            const p = products.find(x => x.id === c.id);
            if (p == null) {continue;}

            const { qty } = c;
            prods.push({ ...p, qty });
        }

        console.log({prods})

        res.render('shop/cart', { prods, pageTitle: 'Your Cart', path: req.originalUrl });
    })();
};

export const postCart = (req, res, next) => {
    const { productId } = req.body;
    if (productId == null) {
        return renderError(res)
    }

    (async () => {
        let product;
        try {
            product = await Product.findById(productId);
        } catch (e) {
            return renderError(res, 404, e.message);
        }

        const { id, price } = product;

        await Cart.addProduct(id, price);

        res.redirect('/cart');
    })();
};

export const postCartDeleteProduct = (req, res, next) => {
    const { productId } = req.body;
    if (productId == null) {
        return renderError(res)
    }

    (async () => {
        let product;
        try {
            product = await Product.findById(productId);
        } catch (e) {
            return renderError(res, 404, e.message);
        }

        const { id, price } = product;
        await Cart.deleteProduct(id, price);

        res.redirect('/cart');
    })();
}


export const getOrders = (req, res, next) => {
    res.render('shop/orders', { pageTitle: 'Orders', path: req.originalUrl });
};

export const getCheckout = (req, res, next) => {
    res.render('shop/checkout', { pageTitle: 'Checkout', path: req.originalUrl });
};

