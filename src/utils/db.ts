
import { executeQuery } from './mockDb';

export { executeQuery };

// Export a mock pool for compatibility with any code that might reference it
export default {
  query: (sql: string, params: any[] = []): Promise<any> => {
    return executeQuery(sql, params);
  }
};
