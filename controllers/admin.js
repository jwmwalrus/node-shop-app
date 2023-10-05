import { validationResult } from 'express-validator';

import Product from '../models/product.js';
import { renderError } from './errors.js';

export const getProducts = (req, res, next) => {
    (async () => {
        let products = [];
        try {
            products = await Product.find({ user: req.user });
        } catch (e) {
            console.error(e);
        }
        res.render('admin/products', { prods: products, pageTitle: 'Products' });
    })();
};

export const getAddProduct = (req, res, next) => {
    res.render('admin/edit-product', { product: {},  pageTitle: 'Add Product', editing: false, input: {} });
};

export const postAddProduct = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(422).render('admin/edit-product', { product: { ...req.body },  pageTitle: 'Add Product', editing: false, errors: errors.array() });
    }

    (async () => {
        try {
            const { title, imageUrl, description, price } = req.body;
            const priceVal = parseFloat(price).toFixed(2);

            const product = new Product({ title, imageUrl, description, price: priceVal, user: req.user });
            await product.save();
            res.redirect('/admin/products');
        } catch (e) {
            console.error(e);
        }
    })();
};

export const getEditProduct = (req, res, next) => {
    (async () => {
        let product;
        try {
            product = await Product.findOne({_id: req.params.productId, user: req.user });
            if (product == null) {
                req.flash('error', 'Product not found');
                return res.redirect('/admin/products');
            }
        } catch (e) {
            renderError(res, 404, 'Product Not Found: '+e.message)
            return
        }
        res.render('admin/edit-product', { product, pageTitle: product.title, editing: true, input: {} });
    })();
};

export const postEditProduct = (req, res, next) => {
    const { id } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(422).render('admin/edit-product', { product: { ...req.body, _id: id },  pageTitle: 'Add Product', editing: false, errors: errors.array() });
    }

    (async () => {
        try {
            const { title, imageUrl, description, price } = req.body;
            const priceVal = parseFloat(price);

            const product = await Product.findOne({_id: id, user: req.user });
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
            console.error(e);
        }
    })();
};

export const postDeleteProduct = (req, res, next) => {
    (async () => {
        try {
            await Product.deleteOne({ _id: req.params.productId, user: req.user });
        } catch (e) {
            console.error(e);
        }

        res.redirect('/admin/products');
    })();
};
