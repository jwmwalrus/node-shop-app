import { MongoClient, ServerApiVersion } from 'mongodb';

// Connection URL
const url = 'mongodb://localhost:27017/shop?retryWrites=true&w=majority';
// const url = 'mongodb+srv://jmore:cs3J2qYMvr1BLRrT@ac-cpkgcw5-shard-00-00.h8c4w9i.mongodb.net/?retryWrites=true&w=majority';
// const url = 'mongodb+srv://jmore:cs3J2qYMvr1BLRrT@cluster0.h8c4w9i.mongodb.net/shop?retryWrites=true&w=majority&ssl=true';
// const uri = "mongodb+srv://jmore:<password>@cluster0.h8c4w9i.mongodb.net/?retryWrites=true&w=majority";

// Database
let _db;

export const mongoConnect = async () => {
    const client = new MongoClient(url, {
        serverApi: {
            version: ServerApiVersion.v1,
            strict: true,
            deprecationErrors: true,
        },
        connectTimeoutMS: 10000,
    });

    try {
        await client.connect();
    } catch (e) {
        throw e;
    }
    _db = client.db();


    console.info('Connected successfully to server');
    return client
}

export const getDb = () => {
    if (_db) {
        return _db;
    }

    throw new Error('No database found');
};
