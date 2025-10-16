import { MongoClient, Db, Collection } from 'mongodb'
import { connectDB } from '@/server/utils/mongoose'
import { Reservation } from '@/server/models/Reservation'
import { Movie } from '@/server/models/Movie'
import { Showtime } from '@/server/models/Showtime'
import { User } from '@/server/models/User'



let _client: MongoClient | null = null
let _db: Db | null = null

export async function getDb(): Promise<Db> {
    if (_db) return _db
    const { mongodbUri } = useRuntimeConfig()
    if (!mongodbUri) throw new Error('Missing mongodbUri in runtimeConfig')

    _client = new MongoClient(mongodbUri)
    await _client.connect()
    _db = _client.db()
    console.log('[mongo] conectado')
    return _db
}
// alias por colección
export const reservationsCol = async () => {
    await connectDB()
    return Reservation
}

export const moviesCol = async () => {
    await connectDB()
    return Movie
}

export const showtimesCol = async () => {
    await connectDB()
    return Showtime
}

export async function usersCol(): Promise<Collection> {
    const db = await getDb()
    return db.collection('users')
}

