
import mysql from 'mysql2/promise';

// Database connection configuration
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Sambhav@2005',
  database: 'project'
};

// Create a pool connection that will be reused across requests
const pool = mysql.createPool(dbConfig);

export async function executeQuery<T>(query: string, params: any[] = []): Promise<T> {
  try {
    const [results] = await pool.query(query, params);
    return results as T;
  } catch (error) {
    console.error('Database error:', error);
    throw new Error('Database operation failed');
  }
}

export default pool;
