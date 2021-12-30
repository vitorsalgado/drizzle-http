import { decorateWithHttpMethod } from './utils/index.ts'

/**
 * Make a PATCH HTTP Request
 * Target: method
 *
 * @param path - relative path
 *
 * @example
 *  \@PATCH('/relative/path/to/:id')
 *  example(\@Param('id') entryId: string): Promise<Result>
 */
export const PATCH = (path: string) => decorateWithHttpMethod(PATCH, 'PATCH', path)
