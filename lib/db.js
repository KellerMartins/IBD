const ServerlessClient = require("serverless-postgres");

const db = new ServerlessClient({
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DATABASE,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  manualMaxConnections: true,
  maxConnections: 5,
});

exports.query = async (query) => {
  try {
    await db.connect();
    const results = await db.query(query);
    await db.clean();
    return results.rows;
  } catch (error) {
    return { error };
  }
};
