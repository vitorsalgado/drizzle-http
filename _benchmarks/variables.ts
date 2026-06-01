export const iterations = (parseInt(process.env.SAMPLES as string, 10) || 100) + 1
export const errorThreshold = parseInt(process.env.ERROR_TRESHOLD as string, 10) || 3
export const connections = parseInt(process.env.CONNECTIONS as string, 10) || 50
export const parallelRequests = parseInt(process.env.PARALLEL as string, 10) || 100
export const pipelining = parseInt(process.env.PIPELINING as string, 10) || 10
