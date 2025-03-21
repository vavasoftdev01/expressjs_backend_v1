import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import { PrismaClient } from '@prisma/client';
import { graphqlHTTP } from 'express-graphql';
import { mergeSchemas } from '@graphql-tools/schema';
import { postSchema } from './graphql/posts';
import PostDataSeeder from './seeder/postDataSeeder';

dotenv.config();
const prisma = new PrismaClient();

// Multiple schema sample in growing app..
const mergedSchema = mergeSchemas({
  schemas: [postSchema],
});

const app: Express = express();
const port = process.env.PORT || 3000;
const data: { id: number; title: string; content: string | null; address: string; createdAt: Date; updatedAt: Date; country: string; }[][] = [];

async function main() {
  const allUsers = await prisma.post.findMany({ orderBy: { id: 'desc' }, take: 50 })
  data.push(allUsers)
}

main().then(async () => {
  await prisma.$disconnect()
})
.catch(async (e) => {
  console.error(e)
  await prisma.$disconnect()
  process.exit(1)
});

app.use(express.json())

const SeedRouter = new PostDataSeeder();
app.use("/seeder", SeedRouter.router);

app.get("/", (req: Request, res: Response) => {
  res.send("Express + TypeScript + Prisma");
});

app.get("/posts", (req: Request, res: Response) => {
  console.table(data)
  res.json({ 'data': data });
});

app.use('/graphql-posts', graphqlHTTP({
  schema: mergedSchema
}));

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});


// {
//   "query": "query { allPosts { id title content address country createdAt updatedAt } }"
// }

// {
//   "query": "query { postsByCountry(country: \"800\") { id title content address country createdAt updatedAt } }"
// }

// {
//   "query": "query { postById(id: 1661) { id title content address country createdAt updatedAt } }"
// }