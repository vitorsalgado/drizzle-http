import { Results } from 'cronometro'
import { table } from 'table'

export function makeParallelRequests(n: number, callback: any): Promise<unknown> {
  return Promise.all(Array.from(Array(n)).map(() => new Promise(callback)))
}

export function printResults(c: number, results: Results): unknown {
  let last: number

  const rows = Object.entries(results)
    .sort((a, b) => (!a[1].success ? -1 : b[1].mean - a[1].mean))
    .map(([name, result]) => {
      if (!result.success) {
        return [name, result.size, 'Errored', 'N/A', 'N/A']
      }

      const { size, mean, standardError } = result
      const relative = last !== 0 ? (last / mean - 1) * 100 : 0

      if (typeof last === 'undefined') {
        last = mean
      }

      return [
        name,
        size,
        `${((c * 1e9) / mean).toFixed(2)} req/sec`,
        `± ${((standardError / mean) * 100).toFixed(2)} %`,
        relative > 0 ? `+ ${relative.toFixed(2)} %` : '-'
      ]
    })

  rows.unshift(['Tests', 'Samples', 'Result', 'Tolerance', 'Difference with slowest'])

  return table(rows, {
    columns: {
      0: {
        alignment: 'left'
      },
      1: {
        alignment: 'right'
      },
      2: {
        alignment: 'right'
      },
      3: {
        alignment: 'right'
      },
      4: {
        alignment: 'right'
      }
    },
    drawHorizontalLine: (index, rowCount) => rowCount === 0,
    border: {
      bodyLeft: '|',
      bodyRight: '|',
      bodyJoin: '|',
      joinLeft: '|',
      joinRight: '|',
      joinJoin: '|',
      joinBody: '-',
      bottomBody: '-',
      topBody: '-'
    }
  })
}
