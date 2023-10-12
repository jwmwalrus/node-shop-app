import express from 'express';

import {
    getIndex,
    getProduct,
    getProducts,
    getCart,
    postCart,
    postCartDeleteProduct,
    getOrders,
    getCheckoutSuccess,
    getCheckout,
    getInvoice,
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
router.get('/orders/:orderId', isAuth, getInvoice);
router.get('/checkout', getCheckout);
router.get('/checkout/success', getCheckoutSuccess);
router.get('/checkout/cancel', isAuth, getCheckout);

export default router;
