import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Post {
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @Column()
  title: string;

  @Column()
  content: string;
}
