const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const mongoose = require('mongoose');
const path = require('path');
const UserRoutes = require('./routes/users.route');
const ProductRoutes = require('./routes/products.route');
const CartRoutes = require('./routes/cart.route');
const OrderRoutes = require('./routes/order.route');
const cookieParser = require('cookie-parser');
const cors=require('cors');
app.use(cors({
    origin: true, 
    credentials: true, 
    
}));


const connectDB = require('./config/db.config');
connectDB();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/api/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/users', UserRoutes);
app.use('/api/products', ProductRoutes);
app.use('/api/cart', CartRoutes);
app.use('/api/orders', OrderRoutes);


app.use((err, req, res, next) => {
    if (err instanceof require('multer').MulterError || err.message?.includes('Only image files')) {
        return res.status(400).json({ message: err.message });
    }
    next(err);
});

app.get('/', (req, res) => {
    res.send('This is TechHub: An ecommerce website for gadgets and mobile accessories.');
})

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
}
)