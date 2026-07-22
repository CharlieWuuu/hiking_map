import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

// 每次使用者送出搜尋（q 不為空）就記一筆，用於統計熱門關鍵字
@Entity('search_queries')
export class SearchQuery {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  query: string;

  @CreateDateColumn()
  created_at: Date;
}
