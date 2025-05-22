// This file provides type safety for environment variables
type Env = {
  NEXT_PUBLIC_SUPABASE_URL: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
  // Add other environment variables here as needed
};

// This will throw an error if required environment variables are missing at runtime
export const env: Env = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  // Add other environment variables here as needed
};

// Validate required environment variables
const requiredVars: (keyof Env)[] = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  // Add other required environment variables here
];

// This will throw an error during build if required variables are missing
if (typeof window === 'undefined') {
  requiredVars.forEach((key) => {
    if (!process.env[key]) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
  });
}
