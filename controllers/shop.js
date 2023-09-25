import Product from '../models/product.js';
import Order from '../models/order.js';
import sequelize from '../util/database.js';

import { renderError } from './errors.js';

export const getIndex = (req, res, next) => {
    (async () => {
        let products = [];
        try {
            products = await Product.findAll( { order: sequelize.literal('rand()'), limit: 5 } );
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
            products = await Product.findAll();
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
            product = await Product.findByPk(req.params.productId);
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

        let prods = [];
        try {
            const products = await Product.findAll();
            prods = await cart.getProducts();
        } catch (e) {
            console.error(e);
        }

        res.render('shop/cart', { prods, pageTitle: 'Your Cart', path: req.originalUrl });
    })();
};

export const postCart = (req, res, next) => {
    const { productId } = req.body;
    if (productId == null) {
        return renderError(res)
    }

    (async () => {
        try {
            const cart = await req.user.getCart();

            const products = await cart.getProducts({ where: { id: productId } });

            let product;
            if (products.length > 0) {
                product = products[0];
            }

            let newQuantity = 1;
            if (product) {
                newQuantity = product.cartItem.quantity+1;
            } else {
                product = await Product.findByPk(productId)
            }

            await cart.addProduct(product, { through: { quantity: newQuantity }})
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
            const cart = await req.user.getCart();

            const products = await cart.getProducts({ where: { id: productId } });

            await products[0].cartItem.destroy();
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
            orders = await req.user.getOrders({ include: ['products'] });
        } catch (e) {
            console.error(e);
        }
        res.render('shop/orders', { orders, pageTitle: 'Orders', path: req.originalUrl });
    })();
};

export const postOrder = (req, res, next) => {
    (async () => {
        try {
            const cart = await req.user.getCart();
            const products = await cart.getProducts();

            if (products.length == 0) {
                res.redirect('/cart');
                return
            }

            const order = await req.user.createOrder();

            await order.addProducts(products.map((product) => {
                product.orderItem = { quantity: product.cartItem.quantity };
                return product;
            }));

            await cart.setProducts(null);
        } catch (e) {
            console.error(e);
        }

        res.redirect('/orders');
    })();
};

export const getCheckout = (req, res, next) => {
    res.render('shop/checkout', { pageTitle: 'Checkout', path: req.originalUrl });
};

