import { validationResult } from 'express-validator';

import Product from '../models/product.js';
import { AppError } from '../middleware/errors.js';

export const getProducts = (req, res, next) => {
    (async () => {
        let products = [];
        try {
            products = await Product.find({ user: req.user });
        } catch (e) {
            return next(
                new AppError('Failed to get products', { cause: e }),
                req,
                res,
            );
        }

        res.render('admin/products', {
            prods: products,
            pageTitle: 'Products',
        });
    })();
};

export const getAddProduct = (req, res) => {
    res.render('admin/edit-product', {
        product: {},
        pageTitle: 'Add Product',
        editing: false,
        input: {},
    });
};

export const postAddProduct = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(422).render('admin/edit-product', {
            product: { ...req.body },
            pageTitle: 'Add Product',
            editing: false,
            errors: errors.array(),
        });
    }

    (async () => {
        try {
            const { title, description, price } = req.body;
            let { imageUrl } = req.body;
            const priceVal = parseFloat(price).toFixed(2);

            if (imageUrl === '//dummy.png') {
                imageUrl = '/dummy.png';
            }

            const product = new Product({
                title,
                imageUrl,
                description,
                price: priceVal,
                user: req.user,
            });
            await product.save();
            res.redirect('/admin/products');
        } catch (e) {
            next(new AppError('Failed to add product', { cause: e }), req, res);
        }
    })();
};

export const getEditProduct = (req, res, next) => {
    (async () => {
        let product;
        try {
            product = await Product.findOne({
                _id: req.params.productId,
                user: req.user,
            });

            if (product == null) {
                req.flash('error', 'Product not found');
                return res.redirect('/admin/products');
            }
        } catch (e) {
            return next(
                new AppError('Product Not Found', { code: 404, cause: e }),
                req,
                res,
            );
        }

        res.render('admin/edit-product', {
            product,
            pageTitle: product.title,
            editing: true,
            input: {},
        });
    })();
};

export const postEditProduct = (req, res, next) => {
    const { id } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(422).render('admin/edit-product', {
            product: { ...req.body, _id: id },
            pageTitle: 'Add Product',
            editing: false,
            errors: errors.array(),
        });
    }

    (async () => {
        try {
            const { title, description, price } = req.body;
            let { imageUrl } = req.body;
            const priceVal = parseFloat(price);

            if (imageUrl === '//dummy.png') {
                imageUrl = '/dummy.png';
            }

            const product = await Product.findOne({ _id: id, user: req.user });
            if (product == null) {
                req.flash('error', 'Product not found');
                return res.redirect('/admin/products');
            }

            product.title = title;
            product.imageUrl = imageUrl;
            product.description = description;
            product.price = priceVal;
            await product.save();

            res.redirect('/admin/products');
        } catch (e) {
            next(
                new AppError('Failed to update product', { cause: e }),
                req,
                res,
            );
        }
    })();
};

export const postDeleteProduct = (req, res, next) => {
    (async () => {
        try {
            await Product.deleteOne({
                _id: req.params.productId,
                user: req.user,
            });
        } catch (e) {
            return next(
                new AppError('Failed to delete product', { cause: e }),
                req,
                res,
            );
        }

        res.redirect('/admin/products');
    })();
};
