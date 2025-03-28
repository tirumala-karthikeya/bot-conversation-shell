
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Pool } from 'pg';
import { v4 as uuidv4 } from 'uuid';

// Load environment variables
dotenv.config();

// Create express app
const app = express();
const port = process.env.PORT || 3001;

// Configure CORS
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
  'http://localhost:5173',
  'http://localhost:3000'
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  }
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
const initDb = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS chatbots (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        avatar_color VARCHAR(50),
        avatar_initial VARCHAR(10),
        description TEXT,
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
  }
};

// API routes for chatbots
app.get('/api/chatbots', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM chatbots ORDER BY created_at DESC');
    
    // Transform data to match frontend model
    const chatbots = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      avatarColor: row.avatar_color,
      avatarInitial: row.avatar_initial,
      description: row.description,
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
    }));
    
    res.json(chatbots);
  } catch (error) {
    console.error('Error fetching chatbots:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/chatbots/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM chatbots WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Chatbot not found' });
    }
    
    const row = result.rows[0];
    
    // Transform data to match frontend model
    const chatbot = {
      id: row.id,
      name: row.name,
      avatarColor: row.avatar_color,
      avatarInitial: row.avatar_initial,
      description: row.description,
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
    };
    
    res.json(chatbot);
  } catch (error) {
    console.error(`Error fetching chatbot ${req.params.id}:`, error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/chatbots', async (req, res) => {
  try {
    const {
      name,
      avatarColor,
      avatarInitial,
      description,
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
    
    const result = await pool.query(`
      INSERT INTO chatbots (
        id, name, avatar_color, avatar_initial, description, unique_url,
        gradient_from, gradient_to, chat_logo_image, icon_avatar_image,
        static_image, body_background_image, chat_header_color,
        welcome_text, api_key, analytics_url
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING *
    `, [
      id, name, avatarColor, avatarInitial, description, uniqueUrl,
      gradient?.from, gradient?.to, chatLogoImage, iconAvatarImage,
      staticImage, bodyBackgroundImage, chatHeaderColor,
      welcomeText, apiKey, analyticsUrl
    ]);
    
    const row = result.rows[0];
    
    // Transform data to match frontend model
    const chatbot = {
      id: row.id,
      name: row.name,
      avatarColor: row.avatar_color,
      avatarInitial: row.avatar_initial,
      description: row.description,
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
    };
    
    res.status(201).json(chatbot);
  } catch (error) {
    console.error('Error creating chatbot:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/chatbots/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      avatarColor,
      avatarInitial,
      description,
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
    
    // Check if chatbot exists
    const checkResult = await pool.query('SELECT * FROM chatbots WHERE id = $1', [id]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Chatbot not found' });
    }
    
    // Update chatbot
    const result = await pool.query(`
      UPDATE chatbots
      SET
        name = COALESCE($1, name),
        avatar_color = COALESCE($2, avatar_color),
        avatar_initial = COALESCE($3, avatar_initial),
        description = COALESCE($4, description),
        gradient_from = COALESCE($5, gradient_from),
        gradient_to = COALESCE($6, gradient_to),
        chat_logo_image = COALESCE($7, chat_logo_image),
        icon_avatar_image = COALESCE($8, icon_avatar_image),
        static_image = COALESCE($9, static_image),
        body_background_image = COALESCE($10, body_background_image),
        chat_header_color = COALESCE($11, chat_header_color),
        welcome_text = COALESCE($12, welcome_text),
        api_key = COALESCE($13, api_key),
        analytics_url = COALESCE($14, analytics_url),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $15
      RETURNING *
    `, [
      name, avatarColor, avatarInitial, description,
      gradient?.from, gradient?.to, chatLogoImage, iconAvatarImage,
      staticImage, bodyBackgroundImage, chatHeaderColor,
      welcomeText, apiKey, analyticsUrl, id
    ]);
    
    const row = result.rows[0];
    
    // Transform data to match frontend model
    const chatbot = {
      id: row.id,
      name: row.name,
      avatarColor: row.avatar_color,
      avatarInitial: row.avatar_initial,
      description: row.description,
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
    };
    
    res.json(chatbot);
  } catch (error) {
    console.error(`Error updating chatbot ${req.params.id}:`, error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/chatbots/:id', async (req, res) => {
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
  try {
    const { id } = req.params;
    const { message, conversationId } = req.body;
    
    // Get chatbot to retrieve API key
    const result = await pool.query('SELECT api_key FROM chatbots WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Chatbot not found' });
    }
    
    const { api_key } = result.rows[0];
    
    if (!api_key) {
      // Return mock response if no API key
      return res.json({
        answer: `This is a simulated response for message: "${message}". Add an API key to get real responses.`,
        conversation_id: conversationId || uuidv4()
      });
    }
    
    // Use the API key to get a real response
    try {
      const payload = {
        inputs: {},
        query: message,
        response_mode: "complete",
        conversation_id: conversationId,
        user: "user-123",
        files: []
      };
      
      const apiResponse = await fetch('https://api.next-agi.com/v1/chat-messages', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${api_key}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      if (!apiResponse.ok) {
        throw new Error(`API error: ${apiResponse.status}`);
      }
      
      const data = await apiResponse.json();
      
      res.json({
        answer: data.answer,
        conversation_id: data.conversation_id
      });
    } catch (apiError) {
      console.error('Error calling external API:', apiError);
      
      // Fallback to mock response
      res.json({
        answer: `Sorry, there was an error connecting to the chat service. Error: ${apiError.message}`,
        conversation_id: conversationId || uuidv4()
      });
    }
  } catch (error) {
    console.error('Error processing chat message:', error);
    res.status(500).json({ error: 'Internal server error' });
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
  }
})();
