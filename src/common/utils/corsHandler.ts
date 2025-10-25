// Read allowed origins from environment variable
const allowedOrigins = process.env.CORS_ALLOWED_ORIGINS ? process.env.CORS_ALLOWED_ORIGINS.split(',') : [];
export const checkCORSOrigin = () => {
  console.log("allowedOrigins", allowedOrigins)
  return (origin: string | undefined, callback: (error: Error | null, allowed: boolean) => void) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"), false);
    }
  };
};