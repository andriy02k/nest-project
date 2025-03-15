import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './post.entity';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post) private postsRepository: Repository<Post>,
  ) {}

  async getAllPosts(): Promise<Post[]> {
    return this.postsRepository.find();
  }

  async createPost(title: string, content: string): Promise<Post> {
    const newPost = this.postsRepository.create({ title, content });
    return this.postsRepository.save(newPost);
  }

  async getPostById(id: number): Promise<Post> {
    const post = await this.postsRepository.findOne({ where: { id } });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return post;
  }

  async deletePost(id: number): Promise<Post> {
    const post = await this.postsRepository.findOne({ where: { id } });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    await this.postsRepository.delete(id);

    return post;
  }
}
