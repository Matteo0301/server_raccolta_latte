import { set, connect as db_connect } from "mongoose"
import Logger from "./util/logger"
import bcrypt from 'bcrypt'
import { User } from "./schemas"

let db: any

async function connect(CONNECTION_STRING: string) {
    set("strictQuery", false)
    try {
        db = await db_connect(CONNECTION_STRING)
    } catch (error) {
        Logger.error("Error connecting to MongoDB: " + error)
        process.exit(1)
    }
}

async function clear() {
    await User.deleteMany({})
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
    const user = await User.find({ username: username }).exec()
    if (user.length > 0) {
        return user[0]
    }
    return null
}

async function getUsers() {
    const u = await User.find().exec()
    let users: any[] = []
    u.forEach((user: any) => {
        users.push({ username: user.username, admin: user.admin })
    })
    return users
}

async function updateUser(username: string, password: string, admin: boolean) {
    const hashedPassword = generateHash(password)
    await User.updateOne({ username: username }, { password: hashedPassword, admin: admin })
}

async function deleteUser(username: string) {
    await User.deleteOne({ username: username })
}


export { connect, close, db, addUser, getUser, getUsers, updateUser, deleteUser, clear, User, generateHash }