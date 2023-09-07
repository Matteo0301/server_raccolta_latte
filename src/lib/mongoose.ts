import { set, connect as db_connect } from "mongoose"
import Logger from "./util/logger"
import bcrypt from 'bcryptjs'
import { User, Raccolta, Origins } from "./schemas"

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
        return false
    }
    await User.create({ username: username, password: hashedPassword, admin: admin })
    return true
}

async function getUser(username: string) {
    const user = await User.find({ username: { $eq: username } }).exec()
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
    await User.updateOne({ username: { $eq: username } }, { $set: { password: hashedPassword, admin: admin } })
}

async function deleteUser(username: string) {
    await User.deleteOne({ username: { $eq: username } })
}

async function addCollection(date: Date, quantity: number, user: string, origin: string) {
    if (date == null) {
        date = new Date()
    }
    await Raccolta.create({ date: date, quantity: quantity, user: user, origin: origin })
}

async function getCollections(start: Date, end: Date) {
    const raccolta = await Raccolta.find({ date: { $gte: start, $lte: end } }).exec()
    return raccolta
}

async function getCollectionByUser(user: string, start: Date, end: Date) {
    const raccolta = await Raccolta.find({ user: user, date: { $gte: start, $lte: end } }).exec()
    return raccolta
}

async function checkCollection(id: String) {
    const r = await Raccolta.find({ _id: id }).exec()
    if (r.length > 0) {
        return true
    }
    return false
}

async function deleteCollection(id: string) {
    await Raccolta.deleteOne({ _id: id }).exec()
}

async function getOrigins() {
    const origins = await Origins.find().exec()
    return origins
}

async function checkOrigin(name: string) {
    const origin = await Origins.find({ name: { $eq: name } }).exec()
    if (origin.length > 0) {
        return true
    }
    return false
}

async function deleteOrigin(name: string) {
    if (await checkOrigin(name)) {
        await Origins.deleteOne({ name: { $eq: name } }).exec()
        return true
    }
    return false
}

async function addOrigin(name: string) {
    if (!await checkOrigin(name)) {
        await Origins.create({ name: name })
        return true
    }
    return false
}

async function getCollectionsByOrigin(origin: string) {
    const raccolta = await Raccolta.find({ origin: origin }).exec()
    return raccolta
}


export { connect, close, db, addUser, getUser, getUsers, updateUser, deleteUser, clear, User, generateHash, addCollection, getCollections, getCollectionByUser, deleteCollection, checkCollection, getOrigins, addOrigin, deleteOrigin, getCollectionsByOrigin }