import { Sequelize } from 'sequelize';

const sequelize = new Sequelize('node_complete', 'jmore', '$omebody2LeanOn', {
    dialect: 'mysql',
    host: '127.0.0.1',
});

export default sequelize;
