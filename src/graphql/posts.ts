import { PrismaClient } from '@prisma/client';
import { makeExecutableSchema } from '@graphql-tools/schema';


const prisma = new PrismaClient();

interface Post {
  id: number;
  title: string;
  content: string;
  address: string;
  country: string;
  createdAt: Date;
  updatedAt: Date;
}

interface Query {
  allPosts: () => Promise<Post[]>;
  postById: (_: any, args: { id: number }) => Promise<Post | null>;
  postsByCountry: (_: any, args: { country: string }) => Promise<Post[]>;
}

const typeDefs = `
  scalar DateTime

  type Post {
    id:        Int
    title:     String
    content:   String
    address:   String
    country:   String
    createdAt: DateTime
    updatedAt: DateTime
  }
  
  type Query {
    allPosts: [Post]!
    postsByCountry(country: String!): [Post]!
    postById(id: Int): Post
  }
`;

const resolvers = {
  Query: {
    allPosts: () => {
      return prisma.post.findMany();
    },
    postsByCountry: async (_: any, { country }: {country: string}) => {
      return await prisma.post.findMany({
        where: { country: country },
      });
    },
    postById: async (_: any, {id}: {id: number}) => {
      return await prisma.post.findUnique({
        where: { id: id },
      });
    },
  }
}

export const postSchema = makeExecutableSchema({
  resolvers,
  typeDefs,
})