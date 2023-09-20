import mysql from 'mysql2';

const pool = mysql.createPool({
    host: '127.0.0.1',
    user: 'jmore',
    database: 'node_complete',
    password: '$omebody2LeanOn',
});

export default pool.promise();
