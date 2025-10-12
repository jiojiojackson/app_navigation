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
    await client.query(`
      CREATE TABLE IF NOT EXISTS websites (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        url TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
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
    const { name, url } = req.body;
    
    if (!name || !url) {
      return res.status(400).json({ error: 'Name and URL are required' });
    }

    const client = await pool.connect();
    try {
      const result = await client.query(
        'INSERT INTO websites (name, url) VALUES ($1, $2) RETURNING *',
        [name, url]
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
