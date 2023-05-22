import { Db, MongoClient } from "mongodb"
import Logger from "./logger"
import bcrypt from 'bcrypt'

let db: Db

async function connect(CONNECTION_STRING: string, DATABASE: string): Promise<void> {
    try {
        const client = new MongoClient(CONNECTION_STRING)
        await client.connect()
        db = client.db(DATABASE)
    } catch (error) {
        Logger.error("Error connecting to MongoDB: " + error)
        process.exit(1)
    }
}

function generateHash(password: string): string {
    let salt_rounds = 10
    if (process.env.SALT_ROUNDS) {
        salt_rounds = parseInt(process.env.SALT_ROUNDS)
    }
    return bcrypt.hashSync(password, bcrypt.genSaltSync(salt_rounds))
}

async function addUser(username: string, password: string, admin: boolean) {
    const hashedPassword = generateHash(password)
    await db.collection('utenti').insertOne({ username: username, password: hashedPassword, admin: admin })
}

async function getUser(username: string) {
    return await db.collection('utenti').findOne({ username: username })
}

async function getUsers() {
    return await db.collection('utenti').find().toArray()
}

async function updateUser(username: string, password: string, admin: boolean) {
    const hashedPassword = generateHash(password)
    await db.collection('utenti').updateOne({ username: username }, { $set: { password: hashedPassword, admin: admin } })
}

async function deleteUser(username: string) {
    await db.collection('utenti').deleteOne({ username: username })
}


export { connect, db, addUser, getUser, getUsers, updateUser, deleteUser }