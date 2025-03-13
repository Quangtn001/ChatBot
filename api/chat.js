export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const baseUrl = 'https://api.llm.ai.vn/v1';
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    console.error('API key is missing');
    return res.status(500).json({ message: 'API key not configured' });
  }
  
  // Log the base URL being used (without exposing the API key)
  console.log('Using API base URL:', baseUrl);
  
  if (!apiKey) {
    return res.status(500).json({ message: 'API key not configured' });
  }

  try {
    const { message, messages = [] } = req.body;

    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    // Prepare conversation history
    const conversationHistory = [...messages, { role: 'user', content: message }];

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: conversationHistory,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorDetails = {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      };
      console.error('API Error:', JSON.stringify(errorDetails, null, 2));
      
      // Provide more specific error messages based on status codes
      if (response.status === 401) {
        throw new Error('Authentication failed. Please check your API key.');
      } else if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      } else {
        throw new Error(`API request failed: ${errorData.error?.message || response.statusText || 'Unknown error'}`);
      }
    }

    const data = await response.json();
    if (!data.choices?.[0]?.message?.content) {
      throw new Error('Invalid response format from API');
    }

    return res.status(200).json({
      message: data.choices[0].message.content
    })
  } catch (error) {
    console.error('OpenAI API error:', error);
    return res.status(500).json({
      message: 'An error occurred while processing your request.'
    });
  }
}