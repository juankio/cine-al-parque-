import mongoose from 'mongoose'
const globalAny = global as any

// Evita crear múltiples conexiones en dev/HMR
if (!globalAny._mongooseConn) {
    globalAny._mongooseConn = { promise: null as null | Promise<typeof mongoose>, conn: null as null | typeof mongoose }
}

export async function connectDB() {
    const { mongodbUri } = useRuntimeConfig()
    if (!mongodbUri) throw new Error('Falta MONGODB_URI')
    if (globalAny._mongooseConn.conn) return globalAny._mongooseConn.conn

    if (!globalAny._mongooseConn.promise) {
        globalAny._mongooseConn.promise = mongoose.connect(mongodbUri, {
            dbName: undefined, // usa el de la URI
            maxPoolSize: 10
        }).then(m => {
            globalAny._mongooseConn.conn = m
            return m
        })
    }
    return globalAny._mongooseConn.promise
}
