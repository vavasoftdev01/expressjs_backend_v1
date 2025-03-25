import express, { Express, Request, Response } from "express";
import PostController from "../controllers/postController";

class Api {
    public router: express.Router;
    postController: PostController;
    
    constructor() {
        this.router = express.Router();
        this.postController = new PostController;
        this.loadRoutes();
    }

    /**
     * Declare all routes here..
     */
    private loadRoutes(): void {
        console.log('Api.ts > initRoutes');
        this.router.get('/posts', this.postController.getPosts)
            .get('/posts/:id', this.postController.getPostById)
            .post('/posts', this.postController.createPost)
            .put('/posts/:id', this.postController.updatePost)
        ;
    }
}

export default Api;