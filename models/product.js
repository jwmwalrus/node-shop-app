import db from '../util/database.js';

export default class Product{
    constructor(id, title, imageUrl, description, price) {
        this.id = id;
        this.title = title;
        this.imageUrl = imageUrl;
        this.description = description;
        this.price = price;
    }

    async save() {
        const { title, price, description, imageUrl} = this;
        if (!this.id) {
            await db.execute(`INSERT INTO products
                (title, price, description, imageUrl)
                VALUES(?, ?, ?, ?)`, [title, price, description, imageUrl]);
        } else {
            await db.execute(`UPDATE products
                SET title = ?, price = ?, description = ?, imageUrl = ?
                WHERE id = ?`, [title, price, description, imageUrl, this.id]);
        }
    }

    static async fetchAll() {
        const result = await db.execute('SELECT * FROM products')
        return result;
    }

    static async findById(id) {
        const [product, fieldData] = await db.execute('SELECT * FROM products WHERE id = ?', [id]);
        return product;
    }

    static async deleteById(id) {
        await db.execute('DELETE FROM products WHERE id = ?', [id]);
    }
}
