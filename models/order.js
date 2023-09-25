import { DataTypes } from 'sequelize';
import sequelize from '../util/database.js';

const Order = sequelize.define('order', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },
});

export default Order;
