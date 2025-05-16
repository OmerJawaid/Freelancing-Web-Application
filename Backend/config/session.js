import session from 'express-session';
import dotenv from 'dotenv';
dotenv.config();

const sessionMiddleware = session({
    secret: process.env.SESSION_SECRET || 'dev-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000 //24 Hours
    }
});

export default sessionMiddleware;