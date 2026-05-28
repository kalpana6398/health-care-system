import { createFileRoute } from '@tanstack/react-router';
import { readFile } from 'fs/promises';

export const Route = createFileRoute('/api/public/download')({
  server: {
    handlers: {
      GET: async () => {
        try {
          const buffer = await readFile('/mnt/documents/project.zip');
          return new Response(buffer, {
            status: 200,
            headers: {
              'Content-Type': 'application/zip',
              'Content-Disposition': 'attachment; filename="healthcare-project.zip"',
              'Content-Length': String(buffer.length),
            },
          });
        } catch {
          return new Response(JSON.stringify({ error: 'File not found' }), {
            status: 404,
            headers: { 'Content-Type': 'application/json' },
          });
        }
      },
    },
  },
});
