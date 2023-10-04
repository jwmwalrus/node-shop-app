import express from 'express';

import {
    getIndex,
    getProduct,
    getProducts,
    getCart,
    postCart,
    postCartDeleteProduct,
    getOrders,
    postOrder,
    getCheckout,
} from '../controllers/shop.js';

import isAuth from '../middleware/is-auth.js';

const router = express.Router();

router.get('/', getIndex);
router.get('/products', getProducts);
router.get('/products/:productId', getProduct);
router.get('/cart', isAuth, getCart);
router.post('/cart', isAuth, postCart);
router.post('/cart-delete-item', isAuth, postCartDeleteProduct);
router.get('/orders', isAuth, getOrders);
router.post('/create-order', isAuth, postOrder);
router.get('/checkout', isAuth, getCheckout);

export default router;
