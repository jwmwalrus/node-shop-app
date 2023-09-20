import { promises as fs } from 'fs';
import { resolve, join } from 'path';

const file = join(resolve('data'), 'products.json')

const getProductsFromFile = async() => {
    let products = [];
    try {
        const data = await fs.readFile(file);
        products = JSON.parse(data);
    } catch (e) {
        console.error(e);
    }
    return products;
};

const saveProductsToFile = async(products) => {
    await fs.writeFile(file, JSON.stringify(products));
};

export default class Product{
    constructor(id, title, imageUrl, description, price) {
        this.id = id;
        this.title = title;
        this.imageUrl = imageUrl;
        this.description = description;
        this.price = price;
    }

    async save() {
        const products = await getProductsFromFile();

        if (!this.id) {
            let maxId = 0;
            for (let p of products) {
                const id = parseInt(p.id, 10);
                if (id > maxId) {maxId = id;}
            }

            this.id = (++maxId).toString();
            products.push(this);
        } else {
            const idx = products.findIndex(p => p.id === this.id)
            if (idx === -1) {
                throw new Error("Product should exist already but it doesn't!?!");
            }
            products[idx] = this;
        }

        await saveProductsToFile(products)
    }

    static async fetchAll() {
        const products = await getProductsFromFile();

        return products;
    }

    static async findById(id) {
        const products = await getProductsFromFile();

        const product = products.find(p => p.id === id);

        if (product == null) {
            throw new Error('Product Not Found');
        }

        return product;
    }

    static async deleteById(id) {
        const products = await getProductsFromFile();

        const updated = products.filter(p => p.id !== id)

        await saveProductsToFile(updated);
    }
}
