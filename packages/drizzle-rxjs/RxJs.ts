import { createClassAndMethodDecorator } from '@drizzle-http/core'

export const RxJs = () =>
  createClassAndMethodDecorator(RxJs, () => {
    /* marker decorator */
  })
