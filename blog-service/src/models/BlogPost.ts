// blog-service/src/models/BlogPost.ts

import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

export enum Theme { // Добавлено export
  FITNESS = 'фитнес',
  HEALTH = 'здоровье',
  NUTRITION = 'питание',
  NONE = '' // Если пост может быть без конкретной темы
}

@Entity()
export class BlogPost {
  @PrimaryGeneratedColumn()
  post_id!: number;

  @Column()
  user_id!: number;

  @Column()
  username!: string;

  @Column()
  email!: string;

  @Column()
  author!: string;

  @Column()
  title!: string;

  @Column({
    type: 'enum',
    enum: Theme,
    nullable: false
  })
  theme!: Theme;

  @Column({ type: 'text' })
  content!: string;

  @Column({ type: 'date', default: () => 'CURRENT_TIMESTAMP' })
  publication_date!: Date;
}