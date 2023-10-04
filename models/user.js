import { Schema, model } from 'mongoose';

const userSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
    },
    resetToken: String,
    resetTokenExpiration: Date,
    cart: {
        items: [{
            product: {
                type: Schema.Types.ObjectId,
                ref: 'Product',
                required: true,
            },
            quantity: {
                type: Number,
                required: true,
            },
        }],
    },
});

userSchema.methods.addToCart = async function(product) {
        const { cart } = this;

        const idx = cart.items.findIndex(p => p.product.equals(product._id));

        if (idx > -1) {
            const quantity = this.cart.items[idx].quantity + 1;
            cart.items[idx] = { product: product._id, quantity };
        } else {
            cart.items.push({ product: product._id, quantity: 1 });
        }

        await this.save();
};


userSchema.methods.removeFromCart = async function(productId) {
    const { cart } = this;

    const items = cart.items.filter(i => i.product.toString() != productId)
    cart.items = items;
    this.cart = cart;
    await this.save();
};

export default model('User', userSchema);
