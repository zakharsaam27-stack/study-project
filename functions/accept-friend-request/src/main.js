import { Client, Databases, ID } from 'node-appwrite';

export default async ({ req, res, log, error }) => {
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT)
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);
  const databases = new Databases(client);

  log(JSON.stringify(req.body));

  const database_id = '6a33f1fa0031afe7debb';
  const friendship_table_id = 'friendships';

  const { rowId, requesterId, addresseeId } = JSON.parse(req.body);

  try {
    log("updating row: " + rowId)
    await databases.updateDocument(database_id, friendship_table_id, rowId, {
      status: 'accepted',
    });
    log("update done")
    await databases.createDocument(
      database_id,
      friendship_table_id,
      ID.unique(),
      { requesterId: addresseeId, addresseeId: requesterId, status: 'accepted' }
    );
  } catch (err) {
    log("error: " + err.message)
    return res.json({ success: false, error: err.message });
  }

  return res.json({ success: true });
};
