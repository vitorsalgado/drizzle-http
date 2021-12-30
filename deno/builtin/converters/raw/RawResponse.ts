import { createMethodDecorator } from '../../../ApiParameterization.ts'

/**
 * Use this to return the full response, including status code, headers, unprocessed body.
 * The {@link Response} is similar to Fetch response implementation
 */
export const RawResponse = () => createMethodDecorator(RawResponse)
