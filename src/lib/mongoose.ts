import { set, connect as db_connect } from "mongoose"
import Logger from "./logger"
import bcrypt from 'bcrypt'
import { User } from "./schemas"
import { get } from "http"

let db: any

async function connect(CONNECTION_STRING: string) {
    set("strictQuery", false)
    try {
        /* client = new MongoClient(CONNECTION_STRING)
        await client.connect()
        db = client.db(DATABASE) */
        db = await db_connect(CONNECTION_STRING)
    } catch (error) {
        Logger.error("Error connecting to MongoDB: " + error)
        process.exit(1)
    }
}

async function close() {
    await db.disconnect()
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
    const user = await getUser(username)
    if (user) {
        await deleteUser(username)
    }
    await User.create({ username: username, password: hashedPassword, admin: admin })
}

async function getUser(username: string) {
    let user = await User.find({ username: username }).exec()
    if (user.length > 0) {
        return user[0]
    }
    return null
}

async function getUsers() {
    let u = await User.find().exec()
    return u
}

async function updateUser(username: string, password: string, admin: boolean) {
    const hashedPassword = generateHash(password)
    await User.updateOne({ username: username }, { password: hashedPassword, admin: admin })
}

async function deleteUser(username: string) {
    await User.deleteOne({ username: username })
}


export { connect, close, db, addUser, getUser, getUsers, updateUser, deleteUser, User }