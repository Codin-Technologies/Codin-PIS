import { NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';
import { getApiDocs } from '@/lib/swagger';

export async function GET() {
  try {
    // In production (Vercel), source .ts files are not available at runtime,
    // so swagger-jsdoc cannot scan them. We serve the pre-generated spec that
    // was built by scripts/generate-swagger.mjs during `next build`.
    if (process.env.NODE_ENV === 'production') {
      const specPath = join(process.cwd(), 'public', 'openapi.json');
      const spec = JSON.parse(readFileSync(specPath, 'utf-8'));
      return NextResponse.json(spec);
    }

    // In development, dynamically scan source files so changes are reflected immediately.
    const spec = await getApiDocs();
    return NextResponse.json(spec);
  } catch (error) {
    console.error('Failed to generate Swagger spec:', error);
    return NextResponse.json(
      { error: 'Failed to generate Swagger docs' },
      { status: 500 }
    );
  }
}
