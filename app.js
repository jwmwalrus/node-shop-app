import { resolve } from 'path';

import express from 'express';
import expressEjsLayouts from 'express-ejs-layouts';

import adminRoutes from './routes/admin.js';
import shopRoutes from './routes/shop.js';
import { errorHandler } from './controllers/errors.js';

const app = express();

app.use(expressEjsLayouts)
app.set('view engine', 'ejs');
app.set('views', 'views');
app.set('layout', './layouts/main-layout')

app.use(express.urlencoded({ extended: true }));
app.use(express.static(resolve('public')));

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorHandler({code: 404, pageTitle: 'Page Not Found'}));

app.listen(3000);
