import { getDb } from '../util/database.js';
import { ObjectId } from 'mongodb';

export default class Product {
    constructor(id, title, imageUrl, description, price, userId) {
        this._id = id ? new ObjectId(id) : null;
        this.title = title;
        this.imageUrl = imageUrl;
        this.description = description;
        this.price = price;
        this.userId = userId;
    }

    async save() {
        const db = getDb();

        try {
            const collection = db.collection('products');


            if (this._id) {
                const { title, imageUrl, description, price} = this;
                await collection.updateOne({ _id: this._id }, { $set: this });
                return
            }
            await collection.insertOne(this);
        } catch (e) {
            console.error(e);
        }
    }

    static async fetchAll() {
        const db = getDb();

        const products = await db.collection('products').find().toArray();
        return products;
    }

    static async fetchSome() {
        const db = getDb();

        const products = await db.collection('products').aggregate([{ $sample: {size: 10} }]).toArray();
        return products;
    }

    static async findById(prodId) {
        const db = getDb();

        const product = await db.collection('products').find({ _id: new ObjectId(prodId) }).next();
        return product;
    }

    static async deleteById(prodId) {
        const db = getDb();

        await db.collection('products').deleteOne({ _id: new ObjectId(prodId) });
    }
}
