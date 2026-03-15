'use client';

import dynamic from 'next/dynamic';
import 'swagger-ui-react/swagger-ui.css';

// Swagger UI needs to be dynamically imported because it relies on window
const SwaggerUI = dynamic(() => import('swagger-ui-react'), { ssr: false });

export default function ApiDocs() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'white', padding: '2rem 0' }}>
      <SwaggerUI url="/api/swagger" />
    </div>
  );
}
