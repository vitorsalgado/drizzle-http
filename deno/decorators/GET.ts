import { decorateWithHttpMethod } from './utils/index.ts'

/**
 * Make a GET HTTP Request
 * Target: method
 *
 * @param path - relative path
 *
 * @example
 *  \@GET('/relative/path/to/:id')
 *  example(\@Param('id') id: string): Promise<any>
 */
export const GET = (path: string) => decorateWithHttpMethod(GET, 'GET', path)
