import { CallAdapter } from '../../../../CallAdapter'
import { Call } from '../../../../Call'

type Fn = (error: Error | null, response: unknown) => void

export class CallbackCallAdapter implements CallAdapter<unknown, void> {
  static INSTANCE: CallbackCallAdapter = new CallbackCallAdapter()

  adapt(action: Call<unknown>): void {
    action
      .execute()
      .then(response => (action.argv[action.argv.length - 1] as Fn)(null, response))
      .catch(error => (action.argv[action.argv.length - 1] as Fn)(error, null))
  }
}
