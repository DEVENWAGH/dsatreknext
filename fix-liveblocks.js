// Add this to your liveblocks auth route to fix SSL issues
const https = require('https');

// Create custom agent for Liveblocks API calls
const agent = new https.Agent({
  rejectUnauthorized: false, // Only for development
  secureProtocol: 'TLSv1_2_method'
});

// Use in fetch calls to Liveblocks
const response = await fetch(url, {
  ...options,
  agent: process.env.NODE_ENV === 'development' ? agent : undefined
});