/** @type {import('next').NextConfig} */
const nextConfig = {
  // Increase timeout for API routes
  api: {
    responseLimit: false,
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
  // Increase static generation timeout
  staticPageGenerationTimeout: 180,
  // Add retry logic for static imports
  onDemandEntries: {
    // period (in ms) where the server will keep pages in the buffer
    maxInactiveAge: 60 * 1000,
    // number of pages that should be kept simultaneously without being disposed
    pagesBufferLength: 5,
  },
}
