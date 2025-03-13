import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());

app.post('/api/chat', async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const baseUrl = 'https://api.llm.ai.vn/v1';
  const apiKey = process.env.VITE_OPENAI_API_KEY;
 
  try {
    const { message, messages = [] } = req.body;

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
        messages: conversationHistory
      })
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    return res.status(200).json({
      message: data.choices[0].message.content
    });
  } catch (error) {
    console.error('OpenAI API error:', error);
    return res.status(500).json({
      message: 'An error occurred while processing your request.'
    });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});