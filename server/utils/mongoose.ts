import mongoose from 'mongoose'
const globalAny = global as any

if (!globalAny._mongooseConn) {
    globalAny._mongooseConn = { promise: null, conn: null }
}

export async function connectDB() {
    const { mongodbUri } = useRuntimeConfig()
    if (!mongodbUri) throw new Error('Falta MONGODB_URI')

    if (globalAny._mongooseConn.conn) return globalAny._mongooseConn.conn

    if (!globalAny._mongooseConn.promise) {
        globalAny._mongooseConn.promise = mongoose.connect(mongodbUri, {
            maxPoolSize: 10
        }).then(m => {
            console.log('✅ Conectado a MongoDB:', m.connection.name)  // 👈 mensaje en consola
            globalAny._mongooseConn.conn = m
            return m
        }).catch(err => {
            console.error('❌ Error conectando a MongoDB:', err.message)
            throw err
        })
    }

    return globalAny._mongooseConn.promise
}
