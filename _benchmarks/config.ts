export const connections = Number.parseInt(process.env.CONNECTIONS ?? '', 10) || 50
export const parallelRequests = Number.parseInt(process.env.PARALLEL ?? '', 10) || 100
export const pipelining = Number.parseInt(process.env.PIPELINING ?? '', 10) || 10
