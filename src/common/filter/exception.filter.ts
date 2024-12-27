import { ArgumentsHost, Catch } from '@nestjs/common';
import { GqlExceptionFilter } from '@nestjs/graphql';
import { GraphQLError } from 'graphql';

@Catch(Error)
export class ExceptionFilter implements GqlExceptionFilter {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  catch(exception: any, host: ArgumentsHost) {
    // TODO: Log original error

    if (exception.name === 'CastError' && exception.kind === 'ObjectId') {
      const message = `Invalid ID format: ${exception.value}`;
      return new GraphQLError(message, {
        extensions: {
          code: 'BAD_USER_INPUT',
          exception: { message },
        },
      });
    }

    const message = exception.message || 'Internal server error';
    return new GraphQLError(message, {
      extensions: {
        code: 'INTERNAL_SERVER_ERROR',
        exception: { message },
      },
    });
  }
}
