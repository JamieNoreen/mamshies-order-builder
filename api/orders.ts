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
  const pipelineId = process.env.GHL_PIPELINE_ID;
  const pipelineStageId = process.env.GHL_NEW_ORDER_STAGE_ID;

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

  if (!pipelineId) {
    console.error('Missing GHL_PIPELINE_ID environment variable');
    return response.status(500).json({
      success: false,
      message: 'Server configuration error: GoHighLevel Pipeline ID is missing.'
    });
  }

  if (!pipelineStageId) {
    console.error('Missing GHL_NEW_ORDER_STAGE_ID environment variable');
    return response.status(500).json({
      success: false,
      message: 'Server configuration error: GoHighLevel New Order Stage ID is missing.'
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
    // 1. Check if the contact already exists to avoid duplicates
    let contactId = '';

    // Search by email first
    if (email) {
      console.log(`Searching for existing contact by email: ${email}`);
      const searchUrl = `https://services.leadconnectorhq.com/contacts/?locationId=${locationId}&query=${encodeURIComponent(email)}`;
      const searchResponse = await fetch(searchUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json',
          'Version': '2021-07-28'
        }
      });
      if (searchResponse.ok) {
        const searchData = await searchResponse.json();
        const matchedContact = searchData.contacts?.find(
          (c: any) => c.email && c.email.toLowerCase() === email.toLowerCase()
        );
        if (matchedContact) {
          contactId = matchedContact.id;
          console.log(`Found existing contact by email: ${contactId}`);
        }
      }
    }

    // Search by phone if not found by email
    if (!contactId && phoneNumber) {
      console.log(`Searching for existing contact by phone: ${phoneNumber}`);
      const searchUrl = `https://services.leadconnectorhq.com/contacts/?locationId=${locationId}&query=${encodeURIComponent(phoneNumber)}`;
      const searchResponse = await fetch(searchUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json',
          'Version': '2021-07-28'
        }
      });
      if (searchResponse.ok) {
        const searchData = await searchResponse.json();
        const cleanPhone = phoneNumber.replace(/\D/g, '');
        const matchedContact = searchData.contacts?.find(
          (c: any) => c.phone && c.phone.replace(/\D/g, '') === cleanPhone
        );
        if (matchedContact) {
          contactId = matchedContact.id;
          console.log(`Found existing contact by phone: ${contactId}`);
        }
      }
    }

    const nameParts = fullName.trim().split(/\s+/);
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    const contactPayload = {
      name: fullName,
      firstName,
      lastName,
      email,
      phone: phoneNumber,
    };

    if (contactId) {
      // Contact exists: Update existing contact via PUT
      console.log(`Updating existing contact (${contactId}):`, JSON.stringify(contactPayload, null, 2));
      const updateContactResponse = await fetch(`https://services.leadconnectorhq.com/contacts/${contactId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Version': '2021-07-28'
        },
        body: JSON.stringify(contactPayload)
      });

      if (!updateContactResponse.ok) {
        const errorText = await updateContactResponse.text();
        console.warn(`Failed to update existing contact ${contactId}:`, errorText);
      } else {
        const contactData = await updateContactResponse.json();
        console.log(`Successfully updated contact:`, JSON.stringify(contactData, null, 2));
      }
    } else {
      // Contact does not exist: Create new contact via POST
      const createPayload = {
        locationId,
        ...contactPayload
      };
      console.log('Creating new contact:', JSON.stringify(createPayload, null, 2));
      const ghlResponse = await fetch('https://services.leadconnectorhq.com/contacts/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Version': '2021-07-28'
        },
        body: JSON.stringify(createPayload)
      });

      if (!ghlResponse.ok) {
        const errorText = await ghlResponse.text();
        console.error('GoHighLevel Contact API Error Status:', ghlResponse.status, 'Response:', errorText);
        let errorMsg = 'Failed to create contact in GoHighLevel.';
        try {
          const errorJson = JSON.parse(errorText);
          if (errorJson.message) {
            errorMsg = `GoHighLevel Contact API error: ${errorJson.message}`;
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
      console.log('GoHighLevel API Create Success:', JSON.stringify(ghlData, null, 2));
      contactId = ghlData.contact?.id;
    }

    if (!contactId) {
      return response.status(500).json({
        success: false,
        message: 'GoHighLevel did not return a valid Contact ID.'
      });
    }

    // 2. Create Opportunity associated with the Contact
    const referenceCode = body.referenceCode || 'Unknown Ref';

    // Format items into a clear, readable text summary
    const items = body.items || [];
    const orderSummary = items
      .map((item: any) => {
        const productTitle = item.product?.title || 'Unknown Product';
        const sizeStr = item.selectedSize ? ` (${item.selectedSize})` : '';
        const qtyStr = `x${item.quantity || 1}`;
        const priceStr = item.price ? ` - ₱${(item.price * (item.quantity || 1)).toLocaleString()}` : '';
        let partyBoxDishesInfo = '';
        if (item.partyBoxDishes && Array.isArray(item.partyBoxDishes) && item.partyBoxDishes.length > 0) {
          partyBoxDishesInfo = `\n  - Dishes: ${item.partyBoxDishes.join(', ')}`;
        }
        return `- ${productTitle}${sizeStr} ${qtyStr}${priceStr}${partyBoxDishesInfo}`;
      })
      .join('\n');

    // TODO: opportunity.payment_method is not currently defined in the checkout payload schema.
    // TODO: opportunity.payment_status is not currently defined in the checkout payload schema.

    const customFields = [
      {
        id: 'B3AtBos0EkjKyJzzftGW',
        field_value: referenceCode
      },
      {
        id: 'UoMTxoXmCMYwXTLusei9',
        field_value: body.clientDetails?.eventDate || ''
      },
      {
        id: 'xYfXyrLJtXEKA7XOONVR',
        field_value: body.clientDetails?.deliveryTime || ''
      },
      {
        id: 'uH394KgaeLYFHHx3tmcY',
        field_value: body.clientDetails?.deliveryOption || ''
      },
      {
        id: 'ACpAoJV1zJRpnoLsHDFR',
        field_value: body.clientDetails?.addressSearch || ''
      },
      {
        id: '55qMnEsry8d6y835drbP',
        field_value: Number(body.subtotal) || 0
      },
      {
        id: 'ajLI5y5x9KVqyelUBX8D',
        field_value: orderSummary
      },
      {
        id: 'o1bgrFJ4aXSUvPcMsevz',
        field_value: body.clientDetails?.additionalRequests || ''
      }
    ];

    const opportunityPayload = {
      pipelineId,
      pipelineStageId,
      contactId,
      name: `${referenceCode} - ${fullName}`,
      monetaryValue: Number(body.subtotal) || 0,
      status: 'open',
      locationId
    };

    console.log('Sending payload to GoHighLevel Create Opportunity:', JSON.stringify(opportunityPayload, null, 2));

    const optResponse = await fetch('https://services.leadconnectorhq.com/opportunities/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Version': '2021-07-28'
      },
      body: JSON.stringify(opportunityPayload)
    });

    if (!optResponse.ok) {
      const errorText = await optResponse.text();
      console.error('GoHighLevel Opportunity API Error Status:', optResponse.status, 'Response:', errorText);
      let errorMsg = 'Failed to create opportunity in GoHighLevel.';
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.message) {
          errorMsg = `GoHighLevel Opportunity API error: ${errorJson.message}`;
        }
      } catch {
        // use fallback errorMsg
      }
      return response.status(optResponse.status).json({
        success: false,
        message: errorMsg
      });
    }

    const optData = await optResponse.json();
    console.log('GoHighLevel API Create Opportunity Success:', JSON.stringify(optData, null, 2));

    const opportunityId = optData.opportunity?.id;

    if (!opportunityId) {
      return response.status(500).json({
        success: false,
        message: 'GoHighLevel did not return a valid Opportunity ID.'
      });
    }

    // 3. Immediately update the Opportunity to populate custom fields
    console.log(`Sending payload to GoHighLevel Update Opportunity (${opportunityId}) Custom Fields:`, JSON.stringify({ customFields }, null, 2));

    const updateResponse = await fetch(`https://services.leadconnectorhq.com/opportunities/${opportunityId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Version': '2021-07-28'
      },
      body: JSON.stringify({
        pipelineId,
        pipelineStageId,
        customFields
      })
    });

    const updateText = await updateResponse.text();
    console.log("Update Status:", updateResponse.status);
    console.log("Update Response:", updateText);

    if (!updateResponse.ok) {
      console.error('GoHighLevel Update Opportunity API Error Status:', updateResponse.status, 'Response:', updateText);
      let errorMsg = 'Failed to update opportunity custom fields in GoHighLevel.';
      try {
        const errorJson = JSON.parse(updateText);
        if (errorJson.message) {
          errorMsg = `GoHighLevel Update Opportunity API error: ${errorJson.message}`;
        }
      } catch {
        // use fallback errorMsg
      }
      return response.status(updateResponse.status).json({
        success: false,
        message: errorMsg
      });
    }

    let updateData = {};
    try {
      updateData = JSON.parse(updateText);
      console.log('GoHighLevel API Update Opportunity Success:', JSON.stringify(updateData, null, 2));
    } catch (e) {
      console.warn("Failed to parse Update Opportunity response as JSON:", e);
    }

    // Return success response with Contact ID and Opportunity ID
    return response.status(200).json({
      success: true,
      message: 'Order and Opportunity successfully registered.',
      contactId: contactId,
      opportunityId: opportunityId,
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
