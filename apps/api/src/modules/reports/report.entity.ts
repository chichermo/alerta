import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from "typeorm";

@Entity({ name: "reports" })
export class ReportEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  title!: string;

  @Column()
  type!: string;

  @Column({ nullable: true })
  description?: string;

  @Column("float")
  lat!: number;

  @Column("float")
  lng!: number;

  @Column({ nullable: true })
  evidenceUrl?: string;

  @Column({ default: "ciudadano" })
  source!: string;

  @Column({ nullable: true })
  userId?: string;

  @CreateDateColumn()
  createdAt!: Date;
}
