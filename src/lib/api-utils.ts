import { NextResponse } from 'next/server';
import prisma from './prisma';
import { getGithUser } from './gith-config';

/**
 * Standard API error response structure
 */
export interface ApiError {
  error: string;
  code?: string;
  details?: any;
}

/**
 * Standard API success response structure
 */
export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
}

/**
 * Create standardized error responses
 */
export const ApiErrors = {
  unauthorized: (message = 'Authentication required'): NextResponse =>
    NextResponse.json({ error: message }, { status: 401 }),
  
  forbidden: (message = 'Access denied'): NextResponse =>
    NextResponse.json({ error: message }, { status: 403 }),
  
  notFound: (resource = 'Resource'): NextResponse =>
    NextResponse.json({ error: `${resource} not found` }, { status: 404 }),
  
  badRequest: (message = 'Invalid request'): NextResponse =>
    NextResponse.json({ error: message }, { status: 400 }),
  
  conflict: (message = 'Resource already exists'): NextResponse =>
    NextResponse.json({ error: message }, { status: 409 }),
  
  serverError: (message = 'Internal server error', details?: any): NextResponse => {
    console.error('Server error:', message, details);
    return NextResponse.json({ error: message }, { status: 500 });
  },
  
  validationError: (message = 'Validation failed', details?: any): NextResponse =>
    NextResponse.json({ error: message, details }, { status: 422 }),
};

/**
 * Create standardized success responses
 */
export const ApiResponses = {
  ok: <T>(data: T, message?: string): NextResponse =>
    NextResponse.json({ data, message }),
  
  created: <T>(data: T, message?: string): NextResponse =>
    NextResponse.json({ data, message }, { status: 201 }),
  
  noContent: (): NextResponse =>
    new NextResponse(null, { status: 204 }),
};

/**
 * Authentication middleware for API routes
 * Returns the authenticated user or null if not authenticated
 */
export async function getAuthenticatedUser(): Promise<{
  id: string;
  email: string;
  name: string | null;
} | null> {
  try {
    const githUser = await getGithUser();
    
    if (!githUser?.email) {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: { email: githUser.email },
      select: { id: true, email: true, name: true }
    });

    return user;
  } catch (error) {
    console.error('Error getting authenticated user:', error);
    return null;
  }
}

/**
 * Require authentication wrapper for API route handlers
 */
export async function requireAuth(): Promise<{
  user: { id: string; email: string; name: string | null };
} | { error: NextResponse }> {
  const user = await getAuthenticatedUser();
  
  if (!user) {
    return {
      error: ApiErrors.unauthorized('No user configured in gith config. Run: gith config user.email <email>')
    };
  }
  
  return { user };
}

/**
 * Safely handle async API route operations with consistent error handling
 */
export async function withErrorHandling<T>(
  operation: () => Promise<T>
): Promise<T | NextResponse> {
  try {
    return await operation();
  } catch (error) {
    console.error('API operation failed:', error);
    return ApiErrors.serverError(
      'An unexpected error occurred',
      process.env.NODE_ENV === 'development' ? error : undefined
    );
  }
}

/**
 * Parse JSON request body with error handling
 */
export async function parseJsonBody<T = any>(request: Request): Promise<{
  body: T;
} | { error: NextResponse }> {
  try {
    const body = await request.json();
    return { body };
  } catch (error) {
    return {
      error: ApiErrors.badRequest('Invalid JSON in request body')
    };
  }
}

/**
 * Validate required fields in request body
 */
export function validateRequiredFields<T extends Record<string, any>>(
  body: T,
  requiredFields: (keyof T)[]
): { error: NextResponse } | null {
  const missingFields = requiredFields.filter(field => 
    body[field] === undefined || body[field] === null || body[field] === ''
  );
  
  if (missingFields.length > 0) {
    return {
      error: ApiErrors.badRequest(
        `Missing required fields: ${missingFields.join(', ')}`
      )
    };
  }
  
  return null;
}