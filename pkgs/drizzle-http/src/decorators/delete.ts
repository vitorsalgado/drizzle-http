import { decorateWithHttpMethod } from './utils'

/**
 * Make a DELETE HTTP Request
 * Target: method
 *
 * @param path - relative path
 *
 * @example
 *  \@DELETE('/relative/path/to/:id')
 *  example(\@Param('id') entryId: string): Promise<Result>
 */
export const DELETE = (path = ''): any => decorateWithHttpMethod('DELETE', path)
