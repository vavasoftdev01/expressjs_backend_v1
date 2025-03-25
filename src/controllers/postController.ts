import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

class PostController {
    private prisma: PrismaClient;

    constructor() {
        this.prisma = new PrismaClient();
    }

    getPosts = async (req: Request, res: Response) => {
        const allPosts = await this.prisma.post.findMany({ orderBy: { id: "desc" }, take: 50 });
        res.json({ data: allPosts });
    };

    getPostById = async (req: Request, res: Response) => {
        const { id } = req.params;
        const post = await this.prisma.post.findFirst({
            where: {
                id: +id
            }
        })

        res.json({ data: post })
    }

    createPost = async (req: Request, res: Response) => {

        try {
            const data = { ...req.body, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
        
            const createPost = await this.prisma.post.create({
                data: data
            });
            res.status(201).json({ data: createPost })
        } catch (error) {
            res.status(500).json({ error: error })
        } 
    }

    updatePost = async (req: Request, res: Response) => {
        try {
            const updatePost = await this.prisma.post.update({
                where: {
                    id: +req.params.id
                },
                data: req.body 
            });
    
            res.status(201).json({ data: updatePost });
        } catch (error) {
            res.status(500).json({ error: error });
        }
    }
}

export default PostController;