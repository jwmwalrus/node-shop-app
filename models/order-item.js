import { DataTypes } from 'sequelize';
import sequelize from '../util/database.js';

const OrderItem = sequelize.define('orderItem', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },
    quantity: DataTypes.INTEGER,
});

export default OrderItem;
