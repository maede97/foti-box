import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const environmentVariables = createEnv({
  server: {
    MONGO_URI: z.url(),
    UPLOAD_FOLDER: z.string(),
    JWT_SECRET: z.string(),
    APP_HOST_URL: z.url(),
  },
  client: {
    NEXT_PUBLIC_APP_HOST_URL: z.url(),
  },
  experimental__runtimeEnv: { NEXT_PUBLIC_APP_HOST_URL: process.env['NEXT_PUBLIC_APP_HOST_URL'] },
  emptyStringAsUndefined: true,

  skipValidation: process.env['BUILD_TARGET'] === 'production',
});
