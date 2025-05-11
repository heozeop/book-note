import { User } from "@/auth/entities/user.entity";
import { Entity, ManyToOne, OneToMany, Collection as OrmCollection, PrimaryKey, Property } from "@mikro-orm/core";
import { v4 } from "uuid";
import { BookCollection } from "./book-collection.entity";

@Entity()
export class Collection {
  @PrimaryKey()
  id: string = v4();

  @Property()
  name: string;

  @Property({ nullable: true, type: "text" })
  description?: string;

  @Property({ nullable: true })
  color?: string;

  @Property()
  isDefault: boolean = false;

  @ManyToOne(() => User)
  owner: User;

  @OneToMany(() => BookCollection, (bookCollection: BookCollection) => bookCollection.collection)
  bookCollections = new OrmCollection<BookCollection>(this);

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();
} 