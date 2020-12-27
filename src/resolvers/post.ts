import { Resolver, Query, Ctx } from 'type-graphql';
import { Post } from '../entities/Post';
import { MyContext } from '../types';

@Resolver()
export class PostResolver {
  @Query(() => [Post])
  posts(
    @Ctx() {em}: MyContext
  ) {
    return em.find(Post);
  }
}
