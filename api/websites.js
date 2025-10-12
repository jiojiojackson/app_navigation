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
        sort_order INTEGER DEFAULT 0,
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
    
    // Add sort_order column if it doesn't exist
    await client.query(`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name='websites' AND column_name='sort_order'
        ) THEN
          ALTER TABLE websites ADD COLUMN sort_order INTEGER DEFAULT 0;
          UPDATE websites SET sort_order = id WHERE sort_order IS NULL;
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
      const result = await client.query('SELECT * FROM websites ORDER BY sort_order ASC, id ASC');
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
      // Get max sort_order
      const maxOrder = await client.query('SELECT COALESCE(MAX(sort_order), 0) as max FROM websites');
      const sortOrder = maxOrder.rows[0].max + 1;
      
      const result = await client.query(
        'INSERT INTO websites (name, url, icon, color, sort_order) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [name, url, icon, color, sortOrder]
      );
      res.status(201).json(result.rows[0]);
    } finally {
      client.release();
    }
  } else if (req.method === 'PUT') {
    const { id, direction } = req.body;
    
    const client = await pool.connect();
    try {
      // Get current website
      const current = await client.query('SELECT * FROM websites WHERE id = $1', [id]);
      if (current.rows.length === 0) {
        return res.status(404).json({ error: 'Website not found' });
      }
      
      const currentSite = current.rows[0];
      const currentOrder = currentSite.sort_order;
      
      // Get adjacent website
      let adjacentQuery;
      if (direction === 'up') {
        adjacentQuery = 'SELECT * FROM websites WHERE sort_order < $1 ORDER BY sort_order DESC LIMIT 1';
      } else {
        adjacentQuery = 'SELECT * FROM websites WHERE sort_order > $1 ORDER BY sort_order ASC LIMIT 1';
      }
      
      const adjacent = await client.query(adjacentQuery, [currentOrder]);
      if (adjacent.rows.length === 0) {
        return res.status(200).json({ message: 'Already at boundary' });
      }
      
      const adjacentSite = adjacent.rows[0];
      const adjacentOrder = adjacentSite.sort_order;
      
      // Swap sort orders
      await client.query('UPDATE websites SET sort_order = $1 WHERE id = $2', [adjacentOrder, id]);
      await client.query('UPDATE websites SET sort_order = $1 WHERE id = $2', [currentOrder, adjacentSite.id]);
      
      res.status(200).json({ success: true });
    } finally {
      client.release();
    }
  } else if (req.method === 'DELETE') {
    const { id } = req.body;
    
    if (!id) {
      return res.status(400).json({ error: 'ID is required' });
    }
    
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
