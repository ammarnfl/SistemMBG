import { NextRequest, NextResponse } from 'next/server';

export async function anyMethod(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const resolvedParams = await params;
  const pathArr = resolvedParams?.path || [];
  const searchParams = req.nextUrl.searchParams;
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
  let targetUrl = `${backendUrl}/${pathArr.join('/')}`;
  
  if (searchParams.toString()) {
    targetUrl += `?${searchParams.toString()}`;
  }

  const token = req.cookies.get('auth_token')?.value;

  const headers = new Headers();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  // Next.js API Routes don't automatically parse bodies if we just want to forward it, 
  // but we can pass the raw body.
  const hasBody = !['GET', 'HEAD'].includes(req.method);
  
  let body: any;
  if (hasBody) {
    try {
      const contentType = req.headers.get('content-type') || 'application/json';
      headers.set('Content-Type', contentType);
      
      if (contentType.includes('multipart/form-data')) {
        // For file uploads, forward raw binary to preserve file integrity
        body = Buffer.from(await req.arrayBuffer());
      } else {
        body = await req.text();
      }
    } catch(e) {}
  }

  try {
    const res = await fetch(targetUrl, {
      method: req.method,
      headers,
      body: hasBody ? body : undefined,
    });

    // Proxy response back. PENTING: gunakan arrayBuffer (bukan text()) supaya
    // data biner (gambar /uploads) tidak rusak akibat decode teks. Pertahankan
    // Content-Type asli agar browser merender gambar dengan benar.
    const buf = Buffer.from(await res.arrayBuffer());
    const resHeaders = new Headers();
    const contentType = res.headers.get('content-type');
    if (contentType) resHeaders.set('Content-Type', contentType);
    const cacheControl = res.headers.get('cache-control');
    if (cacheControl) resHeaders.set('Cache-Control', cacheControl);

    return new NextResponse(buf, {
      status: res.status,
      headers: resHeaders,
    });

  } catch (err: any) {
    console.error('Proxy error:', err);
    return NextResponse.json({ error: 'Proxy Error', message: err.message }, { status: 500 });
  }
}

export const GET = anyMethod;
export const POST = anyMethod;
export const PATCH = anyMethod;
export const PUT = anyMethod;
export const DELETE = anyMethod;
