import { Client, Databases, Query } from 'node-appwrite';

export default async ({ req, res, log, error }) => {
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT)
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);
  const databases = new Databases(client);

  const database_id = '6a33f1fa0031afe7debb';
  const friendship_table_id = 'friendships';

  const { rowId } = JSON.parse(req.body);

  try {
    const friendship = await databases.getDocument(
    database_id,
    friendship_table_id,
    rowId
  );

  const mirror = await databases.listDocuments(
    database_id,
    friendship_table_id,
    [
      Query.equal('requesterId', friendship.addresseeId),
      Query.equal('addresseeId', friendship.requesterId),
    ]
  )

  if (mirror.documents.length === 0) {
  return res.json({
    success: false,
    error: 'Mirror friendship not found',
  });
}
  const mirrorFriendship = mirror.documents[0]
  
    await databases.deleteDocument(database_id, friendship_table_id, friendship.$id)
    await databases.deleteDocument(database_id, friendship_table_id, mirrorFriendship.$id)
  } catch (err) {
    log('error: ' + err.message)
    return res.json({ success: false, error: err.message });
  }

    return res.json({ success: true });
}