require('dotenv').config();

import { __prod__ } from "./constants";
import { MikroORM } from "@mikro-orm/core";
import path from 'path';
import { Post } from "./entities/Post";
import { User } from './entities/User';

export default {
  migrations: {
    path: path.join(__dirname, "./migrations"),
    pattern: /^[\w-]+\d+\.[tj]s$/,
  },
  entities: [Post, User],
  dbName: "lireddit",
  user: "postgres",
  password: process.env.DB_PASSWORD,
  type: "postgresql",
  debug: !__prod__
} as Parameters<typeof MikroORM.init>[0];
