import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

// 百岳 / 小百岳 / 百大必訪步道，trails 和 hikes 都共用這份分類清單
@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;
}
