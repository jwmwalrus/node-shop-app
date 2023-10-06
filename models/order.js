import { Schema, model } from 'mongoose';

const orderSchema = new Schema({
    items: [
        {
            product: {
                type: Object,
                required: true,
            },
            quantity: {
                type: Number,
                required: true,
            },
        },
    ],
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
});

export default model('Order', orderSchema);
