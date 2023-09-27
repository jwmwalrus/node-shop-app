import Product from '../models/product.js';

import { renderError } from './errors.js';

export const getProducts = (req, res, next) => {
    (async () => {
        let products;
        try {
            products = await Product.fetchAll();
        } catch (e) {
            console.error(e);
        }
        res.render('admin/products', { prods: products, pageTitle: 'Products', path: req.originalUrl });
    })();
};

export const getAddProduct = (req, res, next) => {
    res.render('admin/edit-product', { product: {},  pageTitle: 'Add Product', path: req.originalUrl, editing: false });
};

export const postAddProduct = (req, res, next) => {
    const { title, imageUrl, description, price } = req.body;
    const priceVal = parseFloat(price).toFixed(2);

    const product = new Product(null, title, imageUrl, description, priceVal, req.user._id);
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
            // product = products[0];
        } catch (e) {
            renderError(res, 404, 'Product Not Found: '+e.message)
            return
        }
        res.render('admin/edit-product', { product, pageTitle: product.title, path: req.originalUrl, editing: true });
    })();
};

export const postEditProduct = (req, res, next) => {
    const { id, title, imageUrl, description, price } = req.body;
    const priceVal = parseFloat(price);

    const product = new Product(id, title, imageUrl, description, priceVal);
    (async () => {
        await product.save();
        res.redirect('/admin/products');
    })();
};

export const postDeleteProduct = (req, res, next) => {
    (async () => {
        try {
            await Product.deleteById(req.params.productId);
        } catch (e) {
            console.error(e);
        }

        res.redirect('/admin/products');
    })();
};
