// import { readFile } from 'fs/promises';
import { createReadStream } from 'fs';
import { join, resolve } from 'path';

import Product from '../models/product.js';
import Order from '../models/order.js';

import { AppError } from '../middleware/errors.js';

export const getIndex = (req, res, next) => {
    (async () => {
        let products = [];
        try {
            products = await Product.find();
        } catch (e) {
            return next(
                new AppError('Failed to get products', { code: 500, cause: e }),
                req,
                res,
            );
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
            return next(
                new AppError('Failed to get products', { code: 500, cause: e }),
                req,
                res,
            );
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
            return next(
                new AppError('Product Not Found', { code: 404, cause: e }),
                req,
                res,
            );
        }

        res.render('shop/product-detail', {
            product,
            pageTitle: product.title,
        });
    })();
};

export const getCart = (req, res) => {
    (async () => {
        const user = await req.user.populate({ path: 'cart.items.product' });

        res.render('shop/cart', {
            prods: user.cart.items,
            pageTitle: 'Your Cart',
        });
    })();
};

export const postCart = (req, res, next) => {
    const { productId } = req.body;
    if (productId == null) {
        return next(
            new AppError('Invalid product Id', { code: 400 }),
            req,
            res,
        );
    }

    (async () => {
        try {
            const product = await Product.findById(productId);
            await req.user.addToCart(product);
        } catch (e) {
            return next(
                new AppError('Failed to update cart', { code: 400, cause: e }),
                req,
                res,
            );
        }

        res.redirect('/cart');
    })();
};

export const postCartDeleteProduct = (req, res, next) => {
    const { productId } = req.body;
    if (productId == null) {
        return next(
            new AppError('Invalid product Id', { code: 400 }),
            req,
            res,
        );
    }

    (async () => {
        try {
            await req.user.removeFromCart(productId);
        } catch (e) {
            return next(
                new AppError('Failed to delete cart item(s)', {
                    code: 400,
                    cause: e,
                }),
                req,
                res,
            );
        }

        res.redirect('/cart');
    })();
};

export const getOrders = (req, res, next) => {
    (async () => {
        let orders = [];
        try {
            orders = await Order.find({ user: req.user });
        } catch (e) {
            return next(
                new AppError('Failed to get orders', { code: 400, cause: e }),
                req,
                res,
            );
        }

        res.render('shop/orders', { orders, pageTitle: 'Orders' });
    })();
};

export const getInvoice = (req, res, next) => {
    const { orderId } = req.params;
    const invoiceName = `invoice-${orderId}.pdf`;
    const invoicePath = join(resolve('data'), 'invoices', invoiceName);

    (async () => {
        try {
            const order = await Order.findOne({ _id: orderId, user: req.user });

            if (order == null) {
                req.flash('error', 'Invoice not found');
                return res.redirect('/orders');
            }

            // const file = await readFile(invoicePath);
            const file = createReadStream(invoicePath);

            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader(
                'Content-Disposition',
                `inline; filename=${invoiceName}`,
            );
            // res.send(file);
            file.pipe(res);
        } catch (e) {
            console.error(e);
            return next(
                new AppError(`Failed to get invoice ${invoiceName}`, {
                    code: 404,
                    cause: e,
                }),
                req,
                res,
            );
        }
    })();
};

export const postOrder = (req, res, next) => {
    (async () => {
        try {
            const user = await req.user.populate('cart.items.product');
            const order = new Order({ items: user.cart.items, user: req.user });

            if (order.items.length === 0) {
                res.redirect('/cart');
                return;
            }

            await order.save();

            req.user.cart = { items: [] };
            await req.user.save();
        } catch (e) {
            return next(
                new AppError('Failed to create order', { code: 400, cause: e }),
                req,
                res,
            );
        }

        res.redirect('/orders');
    })();
};

export const getCheckout = (req, res) => {
    res.render('shop/checkout', { pageTitle: 'Checkout' });
};
