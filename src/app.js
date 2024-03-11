import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'


const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

// For data coming from url
app.use(express.urlencoded({extended: true, limit: "16kb"}))


// For data coming from json
app.use(express.json({limit: "16kb"}))

// For data in cookie 
app.use(cookieParser());

// For use of data which is in public folder
app.use(express.static("public"))


// Routes 
import userRouter from './routes/user.routes.js';
app.use(process.env.USER_ROUTES, userRouter)

import adminRouter from './routes/admin.routes.js';
app.use(process.env.ADMIN_ROUTES, adminRouter)

export {app}
