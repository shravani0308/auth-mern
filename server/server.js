import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import cookieParser from 'cookie-parser';
import connectDB from './config/mongodb.js';
import authRouter from './routes/authRoutes.js'
import userRouter from './routes/userRoutes.js';

const app =express();
const port =process.env.PORT || 4000;
connectDB();

app.use(express.json());
app.use(cookieParser());
// CORS Configuration
const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        // Get allowed origins from environment variables
        const frontendUrl = process.env.FRONTEND_URL;
        const allowedOrigins = process.env.ALLOWED_ORIGINS ? 
            process.env.ALLOWED_ORIGINS.split(',') : 
            [frontendUrl, 'http://localhost:5173', 'http://localhost:3000'];
        
        // Filter out undefined values and add localhost for development
        const validOrigins = allowedOrigins.filter(Boolean);
        
        console.log(`CORS check - Origin: ${origin}`);
        console.log(`Allowed origins:`, validOrigins);
        
        if (validOrigins.includes(origin)) {
            console.log(`✅ CORS allowed: ${origin}`);
            callback(null, true);
        } else {
            console.log(`❌ CORS blocked: ${origin}`);
            callback(new Error(`Not allowed by CORS: ${origin}`));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
};

app.use(cors(corsOptions));

// API Endpoints
app.get('/',(req,res)=>{
    res.send("API Working ");
});
app.use('/api/auth', authRouter)
app.use('/api/user',userRouter)

// Export for Vercel serverless functions
export default app;

// Only start server if not in Vercel environment
if (process.env.NODE_ENV !== 'production' || process.env.VERCEL !== '1') {
    app.listen(port,()=> console.log(`Server started on PORT:${port}`))
}