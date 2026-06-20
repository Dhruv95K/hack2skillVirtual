import { NextRequest, NextResponse } from 'next/server';
import { POST as signupPOST } from '@/app/api/auth/signup/route';
import { POST as signinPOST } from '@/app/api/auth/signin/route';
import { POST as signoutPOST } from '@/app/api/auth/signout/route';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn()
}));
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      create: jest.fn()
    }
  }
}));
describe('Auth API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  describe('POST /api/auth/signup', () => {
    it('returns 201 with valid body', async () => {
      const validUuid = '123e4567-e89b-12d3-a456-426614174000';
      const mockSignUp = jest.fn().mockResolvedValue({
        data: {
          user: {
            id: validUuid
          }
        },
        error: null
      });
      const mockSignInWithPassword = jest.fn().mockResolvedValue({
        data: {
          user: {
            id: validUuid
          }
        },
        error: null
      });
      createClient.mockResolvedValue({
        auth: {
          signUp: mockSignUp,
          signInWithPassword: mockSignInWithPassword
        }
      });
      prisma.user.create.mockResolvedValue({
        id: validUuid,
        email: 'test@example.com',
        name: 'Test User'
      });
      const request = new NextRequest('http://localhost/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
          name: 'Test User',
          password: 'password123'
        })
      });
      const response = await signupPOST(request);
      const json = await response.json();
      expect(response.status).toBe(201);
      expect(json.user).toEqual({
        id: validUuid,
        email: 'test@example.com',
        name: 'Test User'
      });
    });
    it('returns 400 if email already exists', async () => {
      const mockSignUp = jest.fn().mockResolvedValue({
        data: null,
        error: {
          message: 'User already registered'
        }
      });
      createClient.mockResolvedValue({
        auth: {
          signUp: mockSignUp
        }
      });
      const request = new NextRequest('http://localhost/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({
          email: 'existing@example.com',
          name: 'Existing User',
          password: 'password123'
        })
      });
      const response = await signupPOST(request);
      const json = await response.json();
      expect(response.status).toBe(400);
      expect(json.error).toBe('User already registered');
    });
    it('returns 400 if password < 8 chars', async () => {
      const request = new NextRequest('http://localhost/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
          name: 'Test',
          password: 'short'
        })
      });
      const response = await signupPOST(request);
      const json = await response.json();
      expect(response.status).toBe(400);
      expect(json.error).toBe('Password must be at least 8 characters');
    });
  });
  describe('POST /api/auth/signin', () => {
    it('returns 200 with valid credentials', async () => {
      const mockSignIn = jest.fn().mockResolvedValue({
        data: {
          user: {
            id: 'user-1',
            email: 'test@example.com'
          }
        },
        error: null
      });
      createClient.mockResolvedValue({
        auth: {
          signInWithPassword: mockSignIn
        }
      });
      const request = new NextRequest('http://localhost/api/auth/signin', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123'
        })
      });
      const response = await signinPOST(request);
      const json = await response.json();
      expect(response.status).toBe(200);
      expect(json.user).toEqual({
        id: 'user-1',
        email: 'test@example.com'
      });
    });
    it('returns 401 with wrong password', async () => {
      const mockSignIn = jest.fn().mockResolvedValue({
        data: null,
        error: {
          message: 'Invalid login credentials'
        }
      });
      createClient.mockResolvedValue({
        auth: {
          signInWithPassword: mockSignIn
        }
      });
      const request = new NextRequest('http://localhost/api/auth/signin', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'wrongpassword'
        })
      });
      const response = await signinPOST(request);
      const json = await response.json();
      expect(response.status).toBe(401);
      expect(json.error).toBe('Invalid credentials');
    });
  });
  describe('POST /api/auth/signout', () => {
    it('returns 200', async () => {
      const mockSignOut = jest.fn().mockResolvedValue({
        error: null
      });
      createClient.mockResolvedValue({
        auth: {
          signOut: mockSignOut
        }
      });
      const response = await signoutPOST();
      const json = await response.json();
      expect(response.status).toBe(200);
      expect(json.success).toBe(true);
    });
  });
});