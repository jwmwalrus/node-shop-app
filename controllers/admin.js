import Product from '../models/product.js';

import { renderError } from './errors.js';

export const getProducts = (req, res, next) => {
    (async () => {
        let products = [];
        try {
            products = await Product.find();
        } catch (e) {
            console.error(e);
        }
        res.render('admin/products', { prods: products, pageTitle: 'Products' });
    })();
};

export const getAddProduct = (req, res, next) => {
    res.render('admin/edit-product', { product: {},  pageTitle: 'Add Product', editing: false });
};

export const postAddProduct = (req, res, next) => {
    const { title, imageUrl, description, price } = req.body;
    const priceVal = parseFloat(price).toFixed(2);

    const product = new Product({ title, imageUrl, description, price: priceVal, user: req.user });
    (async () => {
        try {
            await product.save();
        } catch (e) {
            console.error(e);
        }
        res.redirect('/admin/products');
    })();
};

export const getEditProduct = (req, res, next) => {
    (async () => {
        let product;
        try {
            product = await Product.findById(req.params.productId);
        } catch (e) {
            renderError(res, 404, 'Product Not Found: '+e.message)
            return
        }
        res.render('admin/edit-product', { product, pageTitle: product.title, editing: true });
    })();
};

export const postEditProduct = (req, res, next) => {
    const { id, title, imageUrl, description, price } = req.body;
    const priceVal = parseFloat(price);

    (async () => {
        await Product.updateOne( { _id: id }, { title, imageUrl, description, price: priceVal });
        res.redirect('/admin/products');
    })();
};

export const postDeleteProduct = (req, res, next) => {
    (async () => {
        try {
            await Product.deleteOne({ _id: req.params.productId });
        } catch (e) {
            console.error(e);
        }

        res.redirect('/admin/products');
    })();
};
