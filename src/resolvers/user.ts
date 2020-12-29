import { Query, Resolver, Mutation, InputType, ObjectType, Ctx, Arg, Field } from 'type-graphql';
import { User } from '../entities/User';
import { MyContext } from '../types';
import argon2 from 'argon2';

@InputType()
class UsernamePasswordInput {
  @Field()
  username: string;
  @Field()
  password: string;
}

@ObjectType()
class FieldError {
  @Field()
  field: string;
  @Field()
  message: string;
}

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], {nullable: true})
  errors?: FieldError[];

  @Field(() => User, {nullable: true})
  user?: User;
}

@Resolver()
export class UserResolver {

  @Query(() => User, { nullable: true})
  async me(@Ctx() { req, em }: MyContext) {
      if (!req.session.userId) { // TODO: Test to see what happens if userId = 0
        return null;
      }
      const user = await em.findOne(User, {id: req.session.userId})
      return user;
  }

  @Mutation(() => UserResponse)
  async register(
    @Arg('options') options: UsernamePasswordInput,
    @Ctx() {em, req }: MyContext
  ): Promise<UserResponse> {
      if (options.username.length < 2) {
        return {
          errors: [{
            field: 'username',
            message: 'Please choose a longer username'
          }]
        };
      }
      if (options.password.length < 3) { // TODO: After development, increase minimum password length.
        return {
          errors: [{
            field: 'password',
            message: 'Please choose a longer password'
          }]
        };
      }

      const hashedPassword = await argon2.hash(options.password);
      const user = em.create(User, {
        username: options.username,
        password: hashedPassword
      });

      try {
        await em.persistAndFlush(user);
      } catch (err) {
        console.error("message:", err.message);
        // Duplicate username error
        if (err.code === '23505') { // Consider this instead: err.detail.includes('already exists'))
          return {
            errors: [{
              field: 'username',
              message: 'That username is already taken.'
            }]
          }
        }
      }
      // Auto-login when registering
      req.session.userId = user.id;
      
      return { user };
    }

    @Mutation(() => UserResponse)
    async login(
      @Arg('options') options: UsernamePasswordInput,
      @Ctx() { em, req }: MyContext
    ): Promise<UserResponse> {
        const user = await em.findOne(User, {username: options.username})
        if (!user) {
          return {
            errors: [
              {
                field: "username",
                message: "That username doesn't exist."
              },
            ],
          };
        }
        const valid = await argon2.verify(user.password, options.password)
        if (!valid) {
          return {
            errors: [
              {
                field: "password",
                message: "That password doesn't match."
              },
            ],
          };
        }
        req.session.userId = user.id;
        return { user };
      }  
}
