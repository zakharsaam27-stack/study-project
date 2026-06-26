import { Client, Databases, ID } from 'node-appwrite';

export default async ({ req, res, log, error }) => {
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT)
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);
  const databases = new Databases(client);

  log('key defined: ' + !!process.env.APPWRITE_API_KEY);

  log(JSON.stringify(req.body));

  const database_id = '6a33f1fa0031afe7debb';
  const friendship_table_id = 'friendships';

  const { rowId } = JSON.parse(req.body);

  try {
    await databases.deleteDocument(database_id, friendship_table_id, rowId);
  } catch (err) {
    log('error: ' + err.message);
    return res.json({ success: false, error: err.message });
  }

  return res.json({ success: true });
};
