// Checks if Prompt API is available
export function isAIAvailable() {
  return typeof window !== 'undefined' && 'LanguageModel' in window;
}

// JSON Schema for address extraction output
const addressSchema = {
  "type": "object",
  "properties": {
    "city": {
      "type": "string",
      "description": "The city name extracted from the address"
    },
    "state": {
      "type": "string",
      "description": "The state name extracted from the address"
    },
    "pinCode": {
      "type": "string",
      "description": "The PIN code (postal code) extracted from the address",
      "pattern": "^[0-9]{6}$"
    }
  },
  "required": ["city", "state", "pinCode"],
  "additionalProperties": false
};

// Extract address information using structured output
export async function extractAddressInfo(address) {
  if (!isAIAvailable()) {
    throw new Error('Prompt API not available. Enable Chrome AI flags in chrome://flags');
  }

  const session = await window.LanguageModel.create();
  
  const prompt = `Extract the city, state, and PIN code from the following Indian address. 
Return only the extracted information in the specified JSON format.

Address: ${address}

Extract:
- City: The city name
- State: The state name (full name, e.g., "Maharashtra", "Gujarat", "Karnataka")
- PIN Code: The 6-digit PIN code`;

  try {
    const result = await session.prompt(prompt, {
      responseConstraint: addressSchema
    });
    
    session.destroy();
    
    // Parse the JSON result
    const parsed = JSON.parse(result);
    return {
      city: parsed.city || '',
      state: parsed.state || '',
      pinCode: parsed.pinCode || ''
    };
  } catch (error) {
    session.destroy();
    console.error('Address extraction error:', error);
    throw new Error(`Failed to extract address information: ${error.message}`);
  }
}

