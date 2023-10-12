import { resolve, join } from 'path';
import { unlink } from 'fs/promises';
import { validationResult } from 'express-validator';

import Product from '../models/product.js';
import { AppError } from '../middleware/errors.js';

export const getProducts = async (req, res, next) => {
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
};

export const getAddProduct = (req, res) => {
    res.render('admin/edit-product', {
        product: {},
        pageTitle: 'Add Product',
        editing: false,
    });
};

export const postAddProduct = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(422).render('admin/edit-product', {
            product: { ...req.body },
            pageTitle: 'Add Product',
            editing: false,
            errors: errors.array(),
        });
    }

    try {
        const { title, description, price } = req.body;
        const { file } = req;
        const priceVal = parseFloat(price).toFixed(2);

        if (file == null) {
            req.flash('error', 'Attached file is not an image');
            return res.status(422).render('admin/edit-product', {
                product: { ...req.body },
                pageTitle: 'Add Product',
                editing: false,
            });
        }

        const imageUrl = file?.path.replace(/^public/, '') ?? '/dummy.png';

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
};

export const getEditProduct = async (req, res, next) => {
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
};

export const postEditProduct = async (req, res, next) => {
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

    try {
        const { title, description, price } = req.body;
        const { file } = req;
        const priceVal = parseFloat(price);

        const imageUrl = file?.path.replace(/^public/, '') ?? '';

        const product = await Product.findOne({ _id: id, user: req.user });
        if (product == null) {
            req.flash('error', 'Product not found');
            return res.redirect('/admin/products');
        }

        const { imageUrl: oldImageUrl } = product;

        product.title = title;
        if (imageUrl) {
            if (oldImageUrl && oldImageUrl !== '/dummy.png') {
                await unlink(join(resolve('public'), oldImageUrl));
            }
            product.imageUrl = imageUrl;
        }
        product.description = description;
        product.price = priceVal;
        await product.save();

        res.redirect('/admin/products');
    } catch (e) {
        next(new AppError('Failed to update product', { cause: e }), req, res);
    }
};

export const deleteProduct = async (req, res) => {
    const { productId } = req.params;

    try {
        const product = await Product.findOne({
            _id: productId,
            user: req.user,
        });
        if (product == null) {
            return res.status(404).json({ msg: 'Product not found' });
        }

        const { imageUrl } = product;
        if (imageUrl && imageUrl !== '/dummy.png') {
            await unlink(join(resolve('public'), imageUrl));
        }

        await Product.deleteOne({
            _id: productId,
            user: req.user,
        });
        res.status(200).json({ msg: 'Success' });
    } catch (e) {
        return res
            .status(500)
            .json({ msg: `Failed to delete product: ${e.message}` });
    }
};
