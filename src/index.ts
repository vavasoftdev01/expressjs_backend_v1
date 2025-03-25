import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import { graphqlHTTP } from "express-graphql";
import { mergeSchemas } from "@graphql-tools/schema";
import { postSchema } from "./graphql/posts";
import PostDataSeeder from "./seeder/postDataSeeder";
import http from "http";
import Api from "./http/api";
import createSocketServer from "./socketio/createSocketServer";

dotenv.config();
const prisma = new PrismaClient();

// Multiple schema sample in growing app..
const mergedSchema = mergeSchemas({
  schemas: [postSchema],
});

const app: Express = express();
const apiPort = process.env.API_PORT || 3000; // Use this for HTTP requests
const socketPort = process.env.SOCKET_PORT || 6569; // Get Socket.IO port from env
const data: Array<Array<any>> = [];

// Function for fetching posts from the database
async function main() {
  const allUsers = await prisma.post.findMany({ orderBy: { id: 'desc' }, take: 50 });
  data.push(allUsers);
}

main()
  .then(async () => {
    // Make sure to disconnect after the initial fetch
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

app.use(express.json());

const SeedRouter = new PostDataSeeder();
app.use("/seeder", SeedRouter.router);
const ApiRouter = new Api();
app.use("/vavasoft-api", ApiRouter.router)

app.get("/", (req: Request, res: Response) => {
  res.send("Express + TypeScript + Prisma");
});

app.get("/posts", (req: Request, res: Response) => {
  console.table(data);
  res.json({ data });
});

// Set up GraphQL endpoint
app.use(
  "/graphql-posts",
  graphqlHTTP({
    schema: mergedSchema,
  })
);

// Start API server
const server = http.createServer(app);
server.listen(apiPort, () => {
  console.log(`[API server]: Server is running at http://localhost:${apiPort}`);
});

// Start SocketIO server
createSocketServer(+socketPort);