import { CallAdapter } from '../../../../call.adapter'
import { Call } from '../../../../call'

type Fn = (error: Error | null, response: unknown) => void

export class CallbackCallAdapter implements CallAdapter<Promise<unknown>, void> {
  static INSTANCE: CallbackCallAdapter = new CallbackCallAdapter()

  adapt(action: Call<Promise<unknown>>): void {
    action
      .execute()
      .then(response => (action.argv[action.argv.length - 1] as Fn)(null, response))
      .catch(error => (action.argv[action.argv.length - 1] as Fn)(error, null))
  }
}
