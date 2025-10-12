import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function initDatabase() {
  const client = await pool.connect();
  try {
    // Create table if not exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS websites (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        url TEXT NOT NULL,
        icon VARCHAR(50),
        color VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Add icon column if it doesn't exist
    await client.query(`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name='websites' AND column_name='icon'
        ) THEN
          ALTER TABLE websites ADD COLUMN icon VARCHAR(50);
        END IF;
      END $$;
    `);
    
    // Add color column if it doesn't exist
    await client.query(`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name='websites' AND column_name='color'
        ) THEN
          ALTER TABLE websites ADD COLUMN color VARCHAR(50);
        END IF;
      END $$;
    `);
  } finally {
    client.release();
  }
}

export default async function handler(req, res) {
  await initDatabase();

  if (req.method === 'GET') {
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT * FROM websites ORDER BY created_at DESC');
      res.status(200).json(result.rows);
    } finally {
      client.release();
    }
  } else if (req.method === 'POST') {
    const { name, url, icon, color } = req.body;
    
    if (!name || !url) {
      return res.status(400).json({ error: 'Name and URL are required' });
    }

    const client = await pool.connect();
    try {
      const result = await client.query(
        'INSERT INTO websites (name, url, icon, color) VALUES ($1, $2, $3, $4) RETURNING *',
        [name, url, icon, color]
      );
      res.status(201).json(result.rows[0]);
    } finally {
      client.release();
    }
  } else if (req.method === 'DELETE') {
    const id = req.url.split('/').pop();
    
    const client = await pool.connect();
    try {
      await client.query('DELETE FROM websites WHERE id = $1', [id]);
      res.status(200).json({ success: true });
    } finally {
      client.release();
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
