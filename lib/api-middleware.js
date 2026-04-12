import connectDB from './db'
import { getCurrentUser } from './auth'

/**
 * Middleware factory for API routes
 * Reduces duplication by providing common functionality
 */

export function withDB(handler) {
  return async (request, context) => {
    await connectDB()
    return handler(request, context)
  }
}

export function withAuth(handler) {
  return async (request, context) => {
    const currentUser = await getCurrentUser(request)
    if (!currentUser) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      })
    }
    return handler(request, context, { currentUser })
  }
}

export function withDBAndAuth(handler) {
  return async (request, context) => {
    await connectDB()
    const currentUser = await getCurrentUser(request)
    if (!currentUser) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      })
    }
    return handler(request, context, { currentUser })
  }
}
