import { Request, Response, NextFunction } from 'express';

// Extend Express Request interface to include user (if not already defined)
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

/**
 * Middleware to require admin role
 * Must be used after authenticateJWT middleware
 */
export const requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'Authentication required.'
    });
    return;
  }

  if (req.user.role !== 'admin') {
    res.status(403).json({
      success: false,
      message: 'Access denied. Admin role required.'
    });
    return;
  }

  next();
};

/**
 * Middleware to require admin or teacher role
 * Must be used after authenticateJWT middleware
 */
export const requireAdminOrTeacher = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'Authentication required.'
    });
    return;
  }

  if (!['admin', 'teacher'].includes(req.user.role)) {
    res.status(403).json({
      success: false,
      message: 'Access denied. Admin or Teacher role required.'
    });
    return;
  }

  next();
};

/**
 * Middleware to require admin or the user to be accessing their own resource
 * Must be used after authenticateJWT middleware
 */
export const requireAdminOrOwner = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'Authentication required.'
    });
    return;
  }

  const userId = req.params.id || req.params.userId;
  
  // Allow if user is admin or accessing their own resource
  if (req.user.role === 'admin' || req.user.id === userId) {
    next();
    return;
  }

  res.status(403).json({
    success: false,
    message: 'Access denied. Admin role required or access to own resource only.'
  });
};
