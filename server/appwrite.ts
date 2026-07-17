import { Client, Account } from "node-appwrite";

export async function verifyJWT(jwt: string) {
  const client = new Client()
  .setEndpoint(process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!)
  .setJWT(jwt)

  const account = new Account(client)

  return await account.get()
}