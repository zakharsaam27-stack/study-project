// One-off dev script: seeds fake friend profiles + accepted friendships
// pointing at your real account, so you can test the friends list UI
// without creating extra real accounts/simulators.
//
// Setup:
//   1. npm install --save-dev node-appwrite
//   2. Appwrite Console > Overview > Integrate > API Keys > create a key
//      with scope "documents.write" (or "databases.write")
//   3. Fill in APPWRITE_API_KEY and MY_USER_ID below (your own $id, found
//      in Appwrite Console > Auth > Users, or by logging user.$id once
//      from useAuth() in the app)
//   4. node --env-file=.env scripts/seed-friends.js

const {Client, TablesDB, ID} = require("node-appwrite");

const APPWRITE_API_KEY = "api key here";
const MY_USER_ID = "my user id";
const FRIEND_COUNT = 10;

const client = new Client()
  .setEndpoint(process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID)
  .setKey(APPWRITE_API_KEY);

const tablesDB = new TablesDB(client);

const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID;
const PROFILES_TABLE_ID = process.env.EXPO_PUBLIC_APPWRITE_PROFILES_TABLE_ID;
const FRIENDSHIPS_TABLE_ID = process.env.EXPO_PUBLIC_APPWRITE_FRIENDSHIPS_TABLE_ID;

const fakeNames = [
  "Аня", "Игорь", "Марк", "Соня", "Лена",
  "Дима", "Оля", "Вика", "Женя", "Костя",
];

async function seed(count) {
  for (let i = 0; i < count; i++) {
    const busyness = i % 2 === 0 ? "free" : "busy";

    const profile = await tablesDB.createRow({
      databaseId: DATABASE_ID,
      tableId: PROFILES_TABLE_ID,
      rowId: ID.unique(),
      data: {
        name: fakeNames[i % fakeNames.length],
        nickname: `test_friend_${i}`,
        statusEmoji: busyness === "free" ? "😊" : "💼",
        statusText: busyness === "free" ? "Свободен" : "Работаю",
        statusUpdatedAt: new Date().toISOString(),
        busyness,
      },
    });

    await tablesDB.createRow({
      databaseId: DATABASE_ID,
      tableId: FRIENDSHIPS_TABLE_ID,
      rowId: ID.unique(),
      data: {
        requesterId: MY_USER_ID,
        addresseeId: profile.$id,
        status: "accepted",
      },
    });

    console.log(`Created fake friend ${i + 1}/${count}: ${profile.name}`);
  }
}

seed(FRIEND_COUNT)
  .then(() => console.log("Done."))
  .catch((err) => console.error("Seed failed:", err));
