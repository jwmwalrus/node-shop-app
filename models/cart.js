import { promises as fs } from 'fs';
import { resolve, join } from 'path';

const file = join(resolve('data'), 'cart.json')

const getCartFromFile = async() => {
    let cart = { products: [], totalPrice: 0 };
    try {
        const data = await fs.readFile(file);
        cart = JSON.parse(data);
    } catch (e) {
        console.error(e);
    }
    return cart;
};

const saveCartToFile = async(cart) => {
    await fs.writeFile(file, JSON.stringify(cart));
};

export default class Cart {
    static async addProduct(id, price) {
        const cart = await getCartFromFile();

        let idx = cart.products.findIndex(p => p.id === id);
        if (idx === -1) {
            cart.products.push({ id, qty: 1});
        } else {
            const updated = { ...cart.products[idx] };
            updated.qty += 1;
            cart.products[idx] = updated;
        }

        cart.totalPrice += price;

        await saveCartToFile(cart);
    }

    static async deleteProduct(id, price) {
        const cart = await getCartFromFile();
        console.log("deleting cart item:", {id, price})

        const idx = cart.products.findIndex(p => p.id === id);
        if (idx === -1) {return;}

        console.log("found cart item")

        const { qty } = cart.products[idx];

        cart.totalPrice -= qty * price;

        cart.products.splice(idx, 1);

        console.log("new cart:", cart)

        await saveCartToFile(cart);
    }

    static async getCart() {
        const cart = await getCartFromFile();
        return cart;
    }
}
