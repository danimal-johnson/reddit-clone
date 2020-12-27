require('dotenv').config();

import { MikroORM } from "@mikro-orm/core";
import { Post } from "./entities/Post";
import mikroConfig from './mikro-orm.config';

const main = async () => {
  const orm = await MikroORM.init(mikroConfig);
  await orm.getMigrator().up();
  const post = orm.em.create(Post, {title: 'my first post'});
  await orm.em.persistAndFlush(post);
  // await orm.em.nativeInsert(Post, {title: 'my 2nd post'});
  // const posts = await orm.em.find(Post, {});
  // console.log(posts);
}

main()
  .catch(err => {
    console.error(err);
  });