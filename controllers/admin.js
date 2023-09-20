import Product from '../models/product.js';

import { renderError } from './errors.js';

export const getProducts = (req, res, next) => {
    (async () => {
        let products;
        try {
            const [rows, fieldData] = await Product.fetchAll();
            products = rows;
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
    const priceVal = parseFloat(price)

    const p = new Product(null, title, imageUrl, description, priceVal);

    (async () => {
        await p.save();
        res.redirect('/admin/products');
    })();
};

export const getEditProduct = (req, res, next) => {
    (async () => {
        let product;
        try {
            const [row, fieldData] = await Product.findById(req.params.productId);
            product = row;
        } catch (e) {
            renderError(res, 404, 'Product Not Found: '+e.message)
            return
        }
        res.render('admin/edit-product', { product, pageTitle: product.title, path: req.originalUrl, editing: true });
    })();
};

export const postEditProduct = (req, res, next) => {
    const { id, title, imageUrl, description, price } = req.body;
    const priceVal = parseFloat(price)

    const p = new Product(id, title, imageUrl, description, priceVal);

    (async () => {
        await p.save();
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
