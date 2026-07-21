import {Client, Account, TablesDB} from "node-appwrite";
import "dotenv/config";

export const client = new Client()
  .setEndpoint(process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!)
  .setKey(
    "standard_fdac8136646ba694b7ee7696d4999a1f16454cae83b28166ce4c352c03f8e20d6db6113e95e3ed2859f2dadc491b8680ad41edd1e700a8551ece9360f7e01a4f3b7c8e968b55f692415028d3e7053d13127d54a479f93308cb4b7522004f155374c5087b9f5420b33eb9f825e706ab9b42ef924e5e723fad17a49bf4b81c4c2c",
  );

export const database_id = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!;
export const profiles_table_id =
  process.env.EXPO_PUBLIC_APPWRITE_PROFILES_TABLE_ID!;
export const friendship_table_id =
  process.env.EXPO_PUBLIC_APPWRITE_FRIENDSHIPS_TABLE_ID!;
export const tablesDB = new TablesDB(client);

export async function verifyJWT(jwt: string) {
  const authClient = new Client()
    .setEndpoint(process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!)
    .setJWT(jwt);

  const account = new Account(authClient);
  return await account.get();
}
