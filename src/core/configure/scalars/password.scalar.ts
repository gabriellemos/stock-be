import { GraphQLScalarType, Kind, GraphQLError } from 'graphql';
import { z } from 'zod';

export const passwordSchema = z
  .string()
  .min(8, { message: 'Must be at least 8 characters long' })
  .max(32, { message: 'Must be at most 32 characters long' })
  .regex(/[a-zA-Z]/, { message: 'Must contain at least one letter' })
  .regex(/[0-9]/, { message: 'Must contain at least one number' })
  .regex(/[!@#$%^&*]/, {
    message: 'Must contain at least one special character (!@#$%^&*)',
  });

export const PasswordScalar = new GraphQLScalarType({
  name: 'Password',
  description: 'Password custom scalar type',

  parseValue(value: string): string {
    return validatePassword(value);
  },

  serialize(value: string): string {
    return value;
  },

  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      return validatePassword(ast.value);
    }
    throw new GraphQLError('Password must be a string');
  },
});

function validatePassword(value: string): string {
  try {
    passwordSchema.parse(value);
    return value;
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new GraphQLError(error.errors[0].message);
    }
    throw error;
  }
}
