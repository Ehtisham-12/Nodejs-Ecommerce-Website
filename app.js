const express = require('express');
const app = express();
require('dotenv').config();
require('express-async-errors');
const path = require('path');
const fileUpload =  require('express-fileupload');
const cloudinary = require('cloudinary').v2;
const cookieParser = require('cookie-parser');

cloudinary.config({
    cloud_name: process.env.cloud_name, 
    api_key: process.env.cloud_api_key, 
    api_secret: process.env.cloud_api_secret,
    secure: true
})

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
// db
const connectDB = require('./db/connect');

// middleware
const notFound = require('./middleware/not-found');
const errorHandler = require('./middleware/error-handler');
const auth = require('./middleware/auth-middleware');

// routes
const userRoute = require('./routes/userRoute');
const productRoute = require('./routes/productRoute');
const orderRoute = require('./routes/orderRoute');
const paymentRoute = require('./routes/paymentRoute');

app.use(express.urlencoded({extended:false}));
app.use(fileUpload({useTempFiles:true}));
app.use(express.json());
app.use(cookieParser());


app.use(express.static(path.join(__dirname,'/public')));
app.use('/', productRoute);
app.use('/', userRoute);
app.use('/', orderRoute);
app.use('/', auth, paymentRoute);


app.use(errorHandler);
app.use(notFound);


const PORT = process.env.PORT || 3000;

const start = async () => {
    try {
        await connectDB(process.env.MONGO_URI);
        app.listen(PORT, ()=> console.log(`Server listening on port http://localhost:${PORT}`));
    } catch (error) {
        console.log('error', error);
    }
}

start();