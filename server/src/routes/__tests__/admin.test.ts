import request from 'supertest';
import app from '../../index';
import User from '../../models/User';
import { generateToken } from '../../utils/jwt';

describe('Admin Routes', () => {
  let adminToken: string;
  let teacherToken: string;
  let studentToken: string;
  let adminUser: any;
  let teacherUser: any;
  let studentUser: any;

  beforeAll(async () => {
    // Create test users
    adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@test.com',
      password: 'password123',
      role: 'admin'
    });

    teacherUser = await User.create({
      name: 'Teacher User',
      email: 'teacher@test.com',
      password: 'password123',
      role: 'teacher'
    });

    studentUser = await User.create({
      name: 'Student User',
      email: 'student@test.com',
      password: 'password123',
      role: 'student'
    });

    // Generate tokens
    adminToken = generateToken(adminUser);
    teacherToken = generateToken(teacherUser);
    studentToken = generateToken(studentUser);
  });

  afterAll(async () => {
    // Clean up test users
    await User.deleteMany({
      email: { $in: ['admin@test.com', 'teacher@test.com', 'student@test.com'] }
    });
  });

  describe('Authentication and Authorization', () => {
    it('should allow admin access to admin routes', async () => {
      const response = await request(app)
        .get('/api/admin/health')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Admin panel is healthy');
    });

    it('should deny teacher access to admin routes', async () => {
      const response = await request(app)
        .get('/api/admin/health')
        .set('Authorization', `Bearer ${teacherToken}`);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Access denied. Admin role required.');
    });

    it('should deny student access to admin routes', async () => {
      const response = await request(app)
        .get('/api/admin/health')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Access denied. Admin role required.');
    });

    it('should deny access without token', async () => {
      const response = await request(app)
        .get('/api/admin/health');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Access denied. No token provided.');
    });
  });

  describe('User Management Endpoints', () => {
    it('should get all users with pagination', async () => {
      const response = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.users).toBeDefined();
      expect(response.body.data.pagination).toBeDefined();
    });

    it('should get user by ID', async () => {
      const response = await request(app)
        .get(`/api/admin/users/${teacherUser._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.user.name).toBe('Teacher User');
    });

    it('should update user status', async () => {
      const response = await request(app)
        .put(`/api/admin/users/${studentUser._id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ isActive: false });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('deactivated');
    });

    it('should update user role', async () => {
      const response = await request(app)
        .put(`/api/admin/users/${studentUser._id}/role`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ role: 'teacher' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('User role updated successfully');
    });

    it('should create new user', async () => {
      const response = await request(app)
        .post('/api/admin/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'New User',
          email: 'newuser@test.com',
          password: 'password123',
          role: 'student'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('User created successfully');
    });
  });

  describe('System Statistics Endpoint', () => {
    it('should get system statistics', async () => {
      const response = await request(app)
        .get('/api/admin/stats')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.users).toBeDefined();
      expect(response.body.data.assignments).toBeDefined();
      expect(response.body.data.submissions).toBeDefined();
    });
  });

  describe('Content Management Endpoints', () => {
    it('should get all assignments', async () => {
      const response = await request(app)
        .get('/api/admin/assignments')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.assignments).toBeDefined();
      expect(response.body.data.pagination).toBeDefined();
    });

    it('should get all submissions', async () => {
      const response = await request(app)
        .get('/api/admin/submissions')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.submissions).toBeDefined();
      expect(response.body.data.pagination).toBeDefined();
    });
  });

  describe('System Logs Endpoint', () => {
    it('should get system logs', async () => {
      const response = await request(app)
        .get('/api/admin/logs')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.logs).toBeDefined();
    });
  });

  describe('Validation Tests', () => {
    it('should validate user creation data', async () => {
      const response = await request(app)
        .post('/api/admin/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'A', // Too short
          email: 'invalid-email', // Invalid email
          password: '123', // Too short
          role: 'invalid-role' // Invalid role
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });

    it('should validate role update data', async () => {
      const response = await request(app)
        .put(`/api/admin/users/${studentUser._id}/role`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ role: 'invalid-role' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid role');
    });

    it('should validate status update data', async () => {
      const response = await request(app)
        .put(`/api/admin/users/${studentUser._id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ isActive: 'not-a-boolean' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('boolean');
    });
  });
});
