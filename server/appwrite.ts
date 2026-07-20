import { Client, Account, TablesDB } from "node-appwrite";
import "dotenv/config"

export const client = new Client()
  .setEndpoint(process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!)

export const database_id = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!
export const profiles_table_id = process.env.EXPO_PUBLIC_APPWRITE_PROFILES_TABLE_ID!
export const friendship_table_id = process.env.EXPO_PUBLIC_APPWRITE_FRIENDSHIPS_TABLE_ID!
export const tablesDB = new TablesDB(client);

export async function verifyJWT(jwt: string) {
  const authClient = new Client()
  .setEndpoint(process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!)
  .setJWT(jwt)

  const account = new Account(authClient)
  return await account.get()
}
