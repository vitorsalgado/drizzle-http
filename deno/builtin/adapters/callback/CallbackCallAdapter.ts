import { CallAdapter } from '../../../CallAdapter.ts'
import { Call } from '../../../Call.ts'
import { HttpRequest } from '../../../HttpRequest.ts'

type Fn = (error: Error | null, response: unknown) => void

export class CallbackCallAdapter implements CallAdapter<unknown, void> {
  static INSTANCE: CallbackCallAdapter = new CallbackCallAdapter()

  adapt(action: Call<unknown>): (request: HttpRequest, argv: unknown[]) => void {
    return function (request: HttpRequest, argv: unknown[]) {
      action
        .execute(request, argv)
        .then(response => (argv[argv.length - 1] as Fn)(null, response))
        .catch(error => (argv[argv.length - 1] as Fn)(error, null))
    }
  }
}
