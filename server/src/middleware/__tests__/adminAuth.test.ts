import { Request, Response, NextFunction } from 'express';
import { requireAdmin, requireAdminOrTeacher, requireAdminOrOwner } from '../adminAuth';

// Mock request and response objects
const createMockRequest = (user?: any, params?: any): Partial<Request> => ({
  user,
  params: params || {}
});

const createMockResponse = (): Partial<Response> => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const createMockNext = (): NextFunction => jest.fn();

describe('Admin Auth Middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = createMockRequest();
    mockRes = createMockResponse();
    mockNext = createMockNext();
  });

  describe('requireAdmin', () => {
    it('should allow access for admin user', () => {
      mockReq.user = { role: 'admin', id: '123' };
      
      requireAdmin(mockReq as Request, mockRes as Response, mockNext);
      
      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('should deny access for non-admin user', () => {
      mockReq.user = { role: 'teacher', id: '123' };
      
      requireAdmin(mockReq as Request, mockRes as Response, mockNext);
      
      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Access denied. Admin role required.'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should deny access when no user is present', () => {
      requireAdmin(mockReq as Request, mockRes as Response, mockNext);
      
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Authentication required.'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('requireAdminOrTeacher', () => {
    it('should allow access for admin user', () => {
      mockReq.user = { role: 'admin', id: '123' };
      
      requireAdminOrTeacher(mockReq as Request, mockRes as Response, mockNext);
      
      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('should allow access for teacher user', () => {
      mockReq.user = { role: 'teacher', id: '123' };
      
      requireAdminOrTeacher(mockReq as Request, mockRes as Response, mockNext);
      
      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('should deny access for student user', () => {
      mockReq.user = { role: 'student', id: '123' };
      
      requireAdminOrTeacher(mockReq as Request, mockRes as Response, mockNext);
      
      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Access denied. Admin or Teacher role required.'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('requireAdminOrOwner', () => {
    it('should allow access for admin user', () => {
      mockReq.user = { role: 'admin', id: '123' };
      mockReq.params = { id: '456' };
      
      requireAdminOrOwner(mockReq as Request, mockRes as Response, mockNext);
      
      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('should allow access when user accesses their own resource', () => {
      mockReq.user = { role: 'student', id: '123' };
      mockReq.params = { id: '123' };
      
      requireAdminOrOwner(mockReq as Request, mockRes as Response, mockNext);
      
      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('should deny access when user tries to access another user\'s resource', () => {
      mockReq.user = { role: 'student', id: '123' };
      mockReq.params = { id: '456' };
      
      requireAdminOrOwner(mockReq as Request, mockRes as Response, mockNext);
      
      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Access denied. Admin role required or access to own resource only.'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});
