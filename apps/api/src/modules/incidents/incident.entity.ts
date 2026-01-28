import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity({ name: "incidents" })
export class IncidentEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  title!: string;

  @Column()
  type!: string;

  @Column()
  confidence!: string;

  @Column("float")
  lat!: number;

  @Column("float")
  lng!: number;

  @Column({ default: 1 })
  reportsCount!: number;

  @Column({ default: "ciudadano" })
  source!: string;

  @Column({ type: "timestamp", nullable: true })
  lastReportedAt?: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
