import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(request: VercelRequest, response: VercelResponse) {
  // Reject all other HTTP methods with HTTP 405 Method Not Allowed
  console.log("GHL token loaded:", !!process.env.GHL_ACCESS_TOKEN);

  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return response.status(405).json({
      success: false,
      message: 'Method Not Allowed. Only POST requests are accepted.'
    });
  }

  let body = request.body;

  // Validate that the body is valid JSON
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

  // Retrieve GoHighLevel credentials from environment variables
  const accessToken = process.env.GHL_ACCESS_TOKEN;
  const locationId = process.env.GHL_LOCATION_ID;

  if (!accessToken) {
    console.error('Missing GHL_ACCESS_TOKEN environment variable');
    return response.status(500).json({
      success: false,
      message: 'Server configuration error: GoHighLevel Access Token is missing.'
    });
  }

  if (!locationId) {
    console.error('Missing GHL_LOCATION_ID environment variable');
    return response.status(500).json({
      success: false,
      message: 'Server configuration error: GoHighLevel Location ID is missing.'
    });
  }

  // Extract contact fields from clientDetails
  const fullName = body.clientDetails?.fullName || '';
  const email = body.clientDetails?.email || '';
  const phoneNumber = body.clientDetails?.phoneNumber || '';

  if (!fullName) {
    return response.status(400).json({
      success: false,
      message: 'Missing required field: Full Name is required to register a contact.'
    });
  }

  try {
    const nameParts = fullName.trim().split(/\s+/);
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    const ghlPayload = {
      locationId,
      name: fullName,
      firstName,
      lastName,
      email,
      phone: phoneNumber,
    };

    console.log('Sending payload to GoHighLevel Upsert:', JSON.stringify(ghlPayload, null, 2));

    const ghlResponse = await fetch('https://services.leadconnectorhq.com/contacts/upsert', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Version': '2021-07-28'
      },
      body: JSON.stringify(ghlPayload)
    });

    if (!ghlResponse.ok) {
      const errorText = await ghlResponse.text();
      console.error('GoHighLevel API Error Status:', ghlResponse.status, 'Response:', errorText);
      let errorMsg = 'Failed to upsert contact in GoHighLevel.';
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.message) {
          errorMsg = `GoHighLevel API error: ${errorJson.message}`;
        }
      } catch {
        // use fallback errorMsg
      }
      return response.status(ghlResponse.status).json({
        success: false,
        message: errorMsg
      });
    }

    const ghlData = await ghlResponse.json();
    console.log('GoHighLevel API Upsert Success:', JSON.stringify(ghlData, null, 2));

    const contactId = ghlData.contact?.id;

    if (!contactId) {
      return response.status(500).json({
        success: false,
        message: 'GoHighLevel did not return a valid Contact ID.'
      });
    }

    // Return success response with Contact ID
    return response.status(200).json({
      success: true,
      message: 'Order received.',
      contactId: contactId,
      received: body
    });

  } catch (error: any) {
    console.error('Error contacting GoHighLevel:', error);
    return response.status(500).json({
      success: false,
      message: `Internal server error connecting to GoHighLevel: ${error.message || error}`
    });
  }
}
