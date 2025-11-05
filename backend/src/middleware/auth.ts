// middleware/auth.ts
// Fix: Change type-only import to a regular import to resolve type conflicts.
import express from 'express';
import jwt from 'jsonwebtoken';

// Fix: Use an interface to extend Request. This is a more standard and robust way to extend Express types and should resolve property-not-found errors.
export interface AuthRequest extends express.Request {
  user?: { _id: string; isAdmin: boolean };
}

export const protect = (req: AuthRequest, res: express.Response, next: express.NextFunction) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string, isAdmin: boolean };
      
      req.user = { _id: decoded.id, isAdmin: decoded.isAdmin };

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ success: false, message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ success: false, message: 'Not authorized, no token' });
  }
};

export const admin = (req: AuthRequest, res: express.Response, next: express.NextFunction) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(401).json({ success: false, message: 'Not authorized as an admin' });
  }
};