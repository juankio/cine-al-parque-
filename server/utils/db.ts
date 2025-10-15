import { MongoClient, Db, Collection } from 'mongodb'

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

export async function usersCol(): Promise<Collection> {
    const db = await getDb()
    return db.collection('users')
}
