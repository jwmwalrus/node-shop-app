import express from 'express';
import { body } from 'express-validator';

import {
    getProducts,
    getAddProduct,
    postAddProduct,
    getEditProduct,
    postEditProduct,
    postDeleteProduct,
} from '../controllers/admin.js';

import isAuth from '../middleware/is-auth.js';

const titleValidator = body('title', 'At least three characters are required for the title')
    .notEmpty()
    .isLength({ min: 3 })
    .trim();

const imageUrlValidator = body('imageUrl', 'A valid image URL is required')
    .isURL({ allow_protocol_relative_urls: true, require_tld: false });

const priceValidator = body('price', 'A valid price value is required')
    .isFloat();

const descriptionValidator = body('title', 'At least three characters are required for the descriptio')
    .notEmpty()
    .isLength({ min: 3 })
    .trim();

const router = express.Router();

router.get('/products', isAuth, getProducts);
router.get('/add-product', isAuth,  getAddProduct);
router.post('/add-product',
    [titleValidator, imageUrlValidator, priceValidator, descriptionValidator],
    isAuth,
    postAddProduct,
);
router.get('/edit-product/:productId', isAuth, getEditProduct);
router.post('/edit-product/:productId',
    [titleValidator, imageUrlValidator, priceValidator, descriptionValidator],
    isAuth,
    postEditProduct,
);
router.post('/delete-product/:productId', isAuth, postDeleteProduct);

export default router;
