import { getDb } from '../util/database.js';
import { ObjectId } from 'mongodb';

export default class User {
    constructor(id, name, email, cart) {
        this._id = id ? new ObjectId(id) : null;
        this.name = name;
        this.email = email;
        this.cart = cart;
    }

    async save() {
        const db = getDb();

        if (this._id) {
            await db.collection('users').updateOne({ _id: this._id }, { $set: this });
            return
        }

        await db.collection('users').insertOne(this);
    }

    async getCart() {
        const db = getDb();
        const { cart } = this;

        const items = [];

        const cursor = db.collection('products').find({ _id: { $in: cart.items.map(i => i.productId) } });
        for (let p = await cursor.next(); p; p = await cursor.next()) {
            items.push({ ...p, quantity: cart.items.find(i => p._id.equals(i.productId)).quantity });
        }

        cart.items = items;
        return cart;
    }

    async addToCart(product) {
        const db = getDb();
        const { cart } = this;

        const idx = cart.items.findIndex(p => p.productId.equals(product._id));

        if (idx > -1) {
            const quantity = this.cart.items[idx].quantity + 1;
            cart.items[idx] = { productId: product._id, quantity };
        } else {
            cart.items.push({ productId: product._id, quantity: 1 });
        }

        await db.collection('users').updateOne({ _id: this._id }, { $set: { cart } });
    }

    async removeFromCart(productId) {
        const db = getDb();
        const { cart } = this;

        const items = cart.items.filter(i => i.productId.toString() != productId)
        cart.items = items;
        await db.collection('users').updateOne({ _id: this._id }, { $set: { items } });
    }

    async addOrder() {
        const db = getDb();
        const cart = await this.getCart();
        cart.user = { _id: this._id, name: this.name, email: this.email};

        const order = await db.collection('orders').insertOne(cart);
        await db.collection('users').updateOne({ _id: this._id }, { $set: { cart: { items: [] } } });

        return order;
    }

    async getOrders() {
        const db = getDb();

        const orders = await db.collection('orders').find({ 'user._id': this._id }).toArray();

        return orders;
    }

    static async findById(userId) {
        const db = getDb();

        const user = await db.collection('users').findOne({ _id: new ObjectId(userId) });
        return user;
    }

    static async findByEmail(email) {
        const db = getDb();

        const user = await db.collection('users').findOne({ email });
        return user;
    }
}
