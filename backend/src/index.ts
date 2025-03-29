import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Pool } from 'pg';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import { AxiosError } from 'axios';
import https from 'https';

// Load environment variables
dotenv.config();

// Create express app
const app = express();
const port = process.env.PORT || 3001;

// Interfaces for type safety
interface Gradient {
  from?: string;
  to?: string;
}

interface Chatbot {
  id: string;
  name: string;
  avatarColor?: string;
  avatarInitial?: string;
  uniqueUrl?: string;
  gradient?: Gradient;
  createdAt?: Date;
  updatedAt?: Date;
  chatLogoImage?: string;
  iconAvatarImage?: string;
  staticImage?: string;
  bodyBackgroundImage?: string;
  chatHeaderColor?: string;
  welcomeText?: string;
  apiKey?: string;
  analyticsUrl?: string;
}

interface ChatRequest {
  message: string;
  conversationId?: string;
}

interface ChatResponse {
  answer: string;
  conversation_id: string;
}

// Type guard for errors
function isErrorWithMessage(error: unknown): error is Error {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as Error).message === 'string'
  );
}

// Configure CORS
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
  'http://localhost:8080',
  'http://localhost:3000',
  'http://localhost:3001'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true 
}));

// Middleware
app.use(express.json());

// Database connection
const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

// Initialize database tables
const initDb = async (): Promise<void> => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS chatbots (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        avatar_color VARCHAR(50),
        avatar_initial VARCHAR(10),
        unique_url VARCHAR(255),
        gradient_from VARCHAR(50),
        gradient_to VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        chat_logo_image TEXT,
        icon_avatar_image TEXT,
        static_image TEXT,
        body_background_image TEXT,
        chat_header_color VARCHAR(50),
        welcome_text TEXT,
        api_key TEXT,
        analytics_url TEXT
      );
    `);
    console.log('Database tables initialized successfully');
  } catch (error) {
    console.error('Error initializing database tables:', error);
    throw error;
  }
};

// Transform database row to Chatbot interface
const transformChatbotRow = (row: any): Chatbot => ({
  id: row.id,
  name: row.name,
  avatarColor: row.avatar_color,
  avatarInitial: row.avatar_initial,
  uniqueUrl: row.unique_url,
  gradient: row.gradient_from && row.gradient_to ? {
    from: row.gradient_from,
    to: row.gradient_to
  } : undefined,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  chatLogoImage: row.chat_logo_image,
  iconAvatarImage: row.icon_avatar_image,
  staticImage: row.static_image,
  bodyBackgroundImage: row.body_background_image,
  chatHeaderColor: row.chat_header_color,
  welcomeText: row.welcome_text,
  apiKey: row.api_key,
  analyticsUrl: row.analytics_url
});

// API routes for chatbots
app.get('/api/chatbots', async (req: Request, res: Response) => {
  try {
    console.log('Fetching chatbots - Request received');
    
    const result = await pool.query('SELECT * FROM chatbots ORDER BY created_at DESC');
    
    console.log('Chatbots query result:', {
      rowCount: result.rows.length,
      rows: result.rows
    });
    
    const chatbots: Chatbot[] = result.rows.map(transformChatbotRow);
    
    res.json(chatbots);
  } catch (error) {
    console.error('Detailed Error fetching chatbots:', {
      errorName: error instanceof Error ? error.name : 'Unknown Error',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace'
    });
    
    // Send more detailed error response
    res.status(500).json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

app.get('/api/chatbots/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM chatbots WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Chatbot not found' });
    }
    
    const chatbot = transformChatbotRow(result.rows[0]);
    
    res.json(chatbot);
  } catch (error) {
    console.error(`Error fetching chatbot ${req.params.id}:`, error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/chatbots', async (req: Request, res: Response) => {
  try {
    const {
      name,
      avatarColor,
      avatarInitial,
      gradient,
      chatLogoImage,
      iconAvatarImage,
      staticImage,
      bodyBackgroundImage,
      chatHeaderColor,
      welcomeText,
      apiKey,
      analyticsUrl
    } = req.body;
    
    // Generate a unique ID
    const id = `${name.toLowerCase().replace(/\s+/g, "-")}-${Date.now().toString(36)}`;
    const uniqueUrl = `/chatbot/${id}`;
    
    console.log('Received data:', req.body); // For debugging

    const result = await pool.query(`
      INSERT INTO chatbots (
        id, name, avatar_color, avatar_initial, unique_url,
        gradient_from, gradient_to, chat_logo_image, icon_avatar_image,
        static_image, body_background_image, chat_header_color,
        welcome_text, api_key, analytics_url
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *
    `, [
      id,
      name,
      avatarColor,
      avatarInitial || name.charAt(0).toUpperCase(),
      uniqueUrl,
      gradient?.from || null,
      gradient?.to || null,
      chatLogoImage || null,
      iconAvatarImage || null,
      staticImage || null,
      bodyBackgroundImage || null,
      chatHeaderColor || null,
      welcomeText || null,
      apiKey || null,
      analyticsUrl || null
    ]);
    
    const chatbot = transformChatbotRow(result.rows[0]);
    
    res.status(201).json(chatbot);
  } catch (error) {
    console.error('Detailed error creating chatbot:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

app.put('/api/chatbots/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      name,
      avatarColor,
      avatarInitial,
      gradient,
      chatLogoImage,
      iconAvatarImage,
      staticImage,
      bodyBackgroundImage,
      chatHeaderColor,
      welcomeText,
      apiKey,
      analyticsUrl
    } = req.body;
    
    // Log the received data
    console.log('Update request received:', {
      id,
      body: req.body
    });

    // Check if chatbot exists
    const checkResult = await pool.query('SELECT * FROM chatbots WHERE id = $1', [id]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Chatbot not found' });
    }
    
    // Update chatbot without description field
    const result = await pool.query(`
      UPDATE chatbots
      SET
        name = COALESCE($1, name),
        avatar_color = COALESCE($2, avatar_color),
        avatar_initial = COALESCE($3, avatar_initial),
        gradient_from = $4,
        gradient_to = $5,
        chat_logo_image = COALESCE($6, chat_logo_image),
        icon_avatar_image = COALESCE($7, icon_avatar_image),
        static_image = COALESCE($8, static_image),
        body_background_image = COALESCE($9, body_background_image),
        chat_header_color = COALESCE($10, chat_header_color),
        welcome_text = COALESCE($11, welcome_text),
        api_key = COALESCE($12, api_key),
        analytics_url = COALESCE($13, analytics_url),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $14
      RETURNING *
    `, [
      name,
      avatarColor,
      avatarInitial,
      gradient?.from || null,
      gradient?.to || null,
      chatLogoImage,
      iconAvatarImage,
      staticImage,
      bodyBackgroundImage,
      chatHeaderColor,
      welcomeText,
      apiKey,
      analyticsUrl,
      id
    ]);
    
    const chatbot = transformChatbotRow(result.rows[0]);
    console.log('Update successful:', chatbot);
    res.json(chatbot);
  } catch (error) {
    console.error('Error updating chatbot:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

app.delete('/api/chatbots/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Check if chatbot exists
    const checkResult = await pool.query('SELECT * FROM chatbots WHERE id = $1', [id]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Chatbot not found' });
    }
    
    // Delete chatbot
    await pool.query('DELETE FROM chatbots WHERE id = $1', [id]);
    
    res.json({ success: true });
  } catch (error) {
    console.error(`Error deleting chatbot ${req.params.id}:`, error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// API route for chat
app.post('/api/chatbots/:id/chat', async (req, res) => {
  const { id } = req.params;
  const { message, conversationId } = req.body;
  
  try {
    console.log(`Chat request received:`, { id, message, conversationId });
    
    // Verify chatbot exists and get its API key
    const chatbot = await pool.query('SELECT * FROM chatbots WHERE id = $1', [id]);
    if (chatbot.rows.length === 0) {
      return res.status(404).json({ error: 'Chatbot not found' });
    }

    const botApiKey = chatbot.rows[0].api_key || process.env.NEXT_AGI_API_KEY;

    if (!botApiKey) {
      console.log('No API key found in database, using default API key');
      if (!process.env.NEXT_AGI_API_KEY) {
        return res.status(500).json({
          error: 'Configuration error',
          details: 'No API key configured for this chatbot or in environment variables'
        });
      }
    }

    const apiBaseUrl = process.env.NEXT_AGI_API_URL;
    if (!apiBaseUrl) {
      console.error('No API URL configured');
      return res.status(500).json({
        error: 'Configuration error',
        details: 'API URL not configured'
      });
    }
    
    if (!botApiKey) {
      console.error('No API key found for chatbot');
      return res.status(500).json({
        error: 'Configuration error',
        details: 'API key not configured for this chatbot'
      });
    }

    if (!apiBaseUrl) {
      console.error('No API URL configured');
      return res.status(500).json({
        error: 'Configuration error',
        details: 'API URL not configured'
      });
    }

    try {
      console.log('Making request to Next AGI API...', {
        url: `${apiBaseUrl}/chat-messages`,
        apiKey: botApiKey.substring(0, 8) + '...', // Log only first 8 chars of API key
        message: message.substring(0, 50) + '...' // Log only first 50 chars of message
      });
      
      const payload = {
        inputs: {},
        query: message,
        response_mode: "streaming",
        conversation_id: conversationId || uuidv4(),
        user: "user-" + uuidv4(),
        files: []
      };

      const response = await axios({
        method: 'post',
        url: `${apiBaseUrl}/chat-messages`,
        headers: {
          'Authorization': `Bearer ${botApiKey}`,
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream'
        },
        data: payload,
        timeout: 10000,
        httpsAgent: new https.Agent({
          rejectUnauthorized: false // Only for development
        })
      });

      if (response.status === 200 && response.data?.answer) {
        return res.json({
          answer: response.data.answer,
          conversation_id: response.data.conversation_id || conversationId || uuidv4()
        });
      } else {
        console.error('Unexpected API response:', response.data);
        return res.status(503).json({
          error: 'Service unavailable',
          details: 'Received unexpected response from AI service'
        });
      }

    } catch (apiError) {
      console.error('Next AGI API Error:', {
        error: apiError instanceof Error ? apiError.message : 'Unknown error',
        code: (apiError as any).code,
        response: (apiError as any).response?.data,
        status: (apiError as any).response?.status
      });
      
      if (axios.isAxiosError(apiError)) {
        if (apiError.code === 'ECONNREFUSED' || apiError.code === 'ECONNABORTED') {
          return res.status(503).json({
            error: 'Service unavailable',
            details: 'Unable to connect to AI service. Please check your network connection and API configuration.'
          });
        }

        if (apiError.response?.status === 401) {
          return res.status(503).json({
            error: 'Authentication failed',
            details: 'Invalid API key or authentication failed. Please check your API key configuration.'
          });
        }

        if (apiError.response?.status === 404) {
          return res.status(503).json({
            error: 'Service unavailable',
            details: 'AI service endpoint not found. Please check the API URL configuration.'
          });
        }

        return res.status(503).json({
          error: 'AI service error',
          details: apiError.response?.data?.message || apiError.message || 'Unknown error occurred'
        });
      }

      return res.status(500).json({
        error: 'Internal server error',
        details: 'An unexpected error occurred while processing your request'
      });
    }

  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Start server and initialize database
(async () => {
  try {
    await initDb();
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
})();