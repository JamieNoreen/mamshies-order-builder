import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(request: VercelRequest, response: VercelResponse) {
  // Reject all other HTTP methods with HTTP 405 Method Not Allowed
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return response.status(405).json({
      success: false,
      message: 'Method Not Allowed. Only POST requests are accepted.'
    });
  }

  let body = request.body;

  // Validate that the body is valid JSON
  // If Vercel received a string (or if the content-type was not set to application/json), try to parse it.
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      return response.status(400).json({
        success: false,
        message: 'Invalid JSON request body.'
      });
    }
  }

  // Ensure body is not empty/null/undefined
  if (body === undefined || body === null) {
    return response.status(400).json({
      success: false,
      message: 'Request body is empty or invalid JSON.'
    });
  }

  // Log the received payload on the server
  console.log('Received payload:', JSON.stringify(body, null, 2));

  // Return HTTP 200 with success status
  return response.status(200).json({
    success: true,
    message: 'Order received.',
    received: body
  });
}
