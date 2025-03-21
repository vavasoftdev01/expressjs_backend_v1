import express, { Express, Request, Response } from "express";
import { faker } from '@faker-js/faker';
import { PrismaClient } from '@prisma/client';

class PostDataSeeder {
    public router: express.Router;
    public ds;

    constructor() {
        this.router = express.Router();
        this.ds = new PrismaClient();
        this.initRoutes();
    }

    private initRoutes(): void {
        this.router.post('/posts', this.createPosts);
    }

    async createPosts(req: Request, res: Response) {
        const postsData = [];

        for (let index = 0; index < req.body.count; index++) {
            postsData.push({
            'title': `${faker.book.title()} - ${faker.book.author()}`,
            'content': faker.lorem.lines(1),
            'address': `${faker.location.streetAddress()}, ${faker.location.state()}, ${faker.location.country()}`,
            'country': faker.location.countryCode('numeric'),
            'createdAt': new Date(),
            'updatedAt': new Date()
            })
        }
        console.log(postsData)

        try {
            const ds = new PrismaClient()
            await ds.post.deleteMany({ where: {}})
            await ds.post.createMany({ data: postsData})
            res.json({ 'message': 'seeding done!'})
          } catch (error) {
            console.log(error)
          }
    }
}

export default PostDataSeeder;