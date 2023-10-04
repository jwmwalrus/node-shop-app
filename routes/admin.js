import express from 'express';

import {
    getProducts,
    getAddProduct,
    postAddProduct,
    getEditProduct,
    postEditProduct,
    postDeleteProduct,
} from '../controllers/admin.js';

import isAuth from '../middleware/is-auth.js';

const router = express.Router();

router.get('/products', isAuth, getProducts);
router.get('/add-product', isAuth, getAddProduct);
router.post('/add-product', isAuth, postAddProduct);
router.get('/edit-product/:productId', isAuth, getEditProduct);
router.post('/edit-product/:productId', isAuth, postEditProduct);
router.post('/delete-product/:productId', isAuth, postDeleteProduct);

export default router;
