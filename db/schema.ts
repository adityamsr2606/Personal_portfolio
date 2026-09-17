import {sqliteTable,text,integer} from 'drizzle-orm/sqlite-core';
export const portfolio=sqliteTable('portfolio',{id:text('id').primaryKey(),data:text('data').notNull(),draft:text('draft'),revision:integer('revision').notNull().default(1),editor:text('editor'),updatedAt:text('updated_at').notNull()});
export const history=sqliteTable('history',{id:integer('id').primaryKey({autoIncrement:true}),data:text('data').notNull(),revision:integer('revision').notNull(),editor:text('editor').notNull(),createdAt:text('created_at').notNull()});
export const media=sqliteTable('media',{id:text('id').primaryKey(),name:text('name').notNull(),type:text('type').notNull(),size:integer('size').notNull(),createdAt:text('created_at').notNull()});
