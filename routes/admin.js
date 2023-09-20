import express from 'express';

import {
    getProducts,
    getAddProduct,
    postAddProduct,
    getEditProduct,
    postEditProduct,
    postDeleteProduct,
} from '../controllers/admin.js';

const router = express.Router();

router.get('/products', getProducts);
router.get('/add-product', getAddProduct);
router.post('/add-product', postAddProduct);
router.get('/edit-product/:productId', getEditProduct);
router.post('/edit-product/:productId', postEditProduct);
router.post('/delete-product/:productId', postDeleteProduct);

export default router;
