import {Account, Client, TablesDB } from "react-native-appwrite";

export const client = new Client()
  .setEndpoint(process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!)
  .setPlatform(process.env.EXPO_PUBLIC_APPWRITE_PLATFORM!);
export const account = new Account(client);
export const tablesDB = new TablesDB(client);
export const database_id = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!
export const profiles_table_id = process.env.EXPO_PUBLIC_APPWRITE_PROFILES_TABLE_ID!
export const friendship_table_id = process.env.EXPO_PUBLIC_APPWRITE_FRIENDSHIPS_TABLE_ID!