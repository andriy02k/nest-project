import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { PostsService } from './posts.service';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  async getAllPosts() {
    return this.postsService.getAllPosts();
  }

  @Post()
  async createPost(@Body() body: { title: string; content: string }) {
    return this.postsService.createPost(body.title, body.content);
  }

  @Get(':id')
  async getPostById(@Param('id') id: number) {
    return this.postsService.getPostById(id);
  }

  @Delete(':id')
  async deletePost(@Param('id') id: number) {
    return this.postsService.deletePost(id);
  }
}
