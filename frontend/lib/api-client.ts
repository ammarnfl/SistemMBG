export const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

// Client-side API call util that forwards requests.
// For server components, we normally fetch directly via fetch() from backend
export const fetchApi = async <T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> => {
  // We proxy via our own Next.js API route to attach the httpOnly cookie
  // But wait, the standard way is: Next.js API route handles login, then gives httpOnly cookie.
  // Next.js Server Components can read the cookie and attach to backend calls.
  // Client components will call standard Next.js route API, or call backend directly?
  // Since we use httpOnly cookie, client CANNOT attach Bearer token!
  // It has to be attached automatically by the browser ONLY to Next.js domain,
  // or we use Next.js server actions/proxy route for everything.
  // Since this is standard NestJS+NextJS, let's keep token in client localStorage for simplicity as typical SPA?
  // No, the instruction (Implementation Plan) stated: httpOnly cookie.
  // To keep it simple, we will call our own /api/proxy/[...path] to attach the cookie, OR we use Server Actions.
  return {} as T;
};
