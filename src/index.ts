import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import { graphqlHTTP } from "express-graphql";
import { mergeSchemas } from "@graphql-tools/schema";
import { postSchema } from "./graphql/posts";
import PostDataSeeder from "./seeder/postDataSeeder";
import http from "http"; // Importing http to create a server
import { Server as SocketServer } from "socket.io"; // Import Socket.IO
import Api from "./http/api";

// Load environment variables from .env file
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

// Start the API server and listen on `apiPort`
const server = http.createServer(app);

// Start API server
server.listen(apiPort, () => {
  console.log(`[API server]: Server is running at http://localhost:${apiPort}`);
});

// Create a separate Socket.IO server on `socketPort`
const io = new SocketServer(+socketPort); // Listening on the defined socket port

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Example: Listen for messages on Socket.IO
  socket.on("message", (msg) => {
    console.log("Message received:", msg);
    // Broadcast the message to all clients
    io.emit("message", msg);
  });

  // Handle user disconnection
  socket.on("disconnect", () => {
    console.log("A user disconnected:", socket.id);
  });
});

// Log that the Socket.IO server is running
console.log(`[Socket.IO server]: Server is running at http://localhost:${socketPort}`);

// {
//   "query": "query { allPosts { id title content address country createdAt updatedAt } }"
// }

// {
//   "query": "query { postsByCountry(country: \"800\") { id title content address country createdAt updatedAt } }"
// }

// {
//   "query": "query { postById(id: 1661) { id title content address country createdAt updatedAt } }"
// }