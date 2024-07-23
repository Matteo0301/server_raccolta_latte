import { set, connect as db_connect, Types, mongo } from "mongoose"
import Logger from "./util/logger"
import bcrypt from 'bcryptjs'
import { User, Collection, Origins } from "./schemas"
import fs from 'fs';
import { Response } from "express"
import path from "path";
        
let db: any
const dir = process.env.PWD + '/images/';
const prefix = dir + 'raccolta_'

async function connect(CONNECTION_STRING: string) {
    set("strictQuery", false)
    try {
        db = await db_connect(CONNECTION_STRING)
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
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

async function updateUser(username: string, newName: string, password: string, admin: boolean) {
    const hashedPassword = generateHash(password)
    await User.updateOne({ username: { $eq: username } }, { $set: { username: newName, password: hashedPassword, admin: admin } })
}

async function deleteUser(username: string) {
    await User.deleteOne({ username: { $eq: username } })
}

async function addCollection(date: Date, quantity: number, quantity2: number, user: string, origin: string) {
    if (date == null) {
        date = new Date()
    }
    await Collection.create({ date: date, quantity: quantity, user: user, origin: origin, quantity2: quantity2 })
}

async function getCollections(start: Date, end: Date) {
    const raccolta = await Collection.find({ date: { $gte: start, $lte: end } }).sort("date").exec()
    return raccolta
}

async function getCollectionByUser(user: string, start: Date, end: Date) {
    const raccolta = await Collection.find({ user: user, date: { $gte: start, $lte: end } }).sort("date").exec()
    return raccolta
}

async function checkCollection(id: string) {
    if (!Types.ObjectId.isValid(id))
        return false
    const r = await Collection.find({ _id: id }).exec()
    if (r.length > 0) {
        return true
    }
    return false
}

async function deleteCollection(id: string) {
    await Collection.deleteOne({ _id: id }).exec()
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

async function getOrigin(name: string) {
    const origin = await Origins.findOne({ name: { $eq: name } }).exec()
    return origin
}

async function deleteOrigin(name: string) {
    if (await checkOrigin(name)) {
        await Origins.deleteOne({ name: { $eq: name } }).exec()
        return true
    }
    return false
}

async function addOrigin(name: string, lat: number, lng: number) {
    if (!await checkOrigin(name)) {
        await Origins.create({ name: name, lat: lat, lng: lng })
        return true
    }
    return false
}

async function updateOrigin(name: string, newName: string, lat: number, lng: number) {
    if (await checkOrigin(name)) {
        await Origins.updateOne({ name: { $eq: name } }, { name: newName, lat: lat, lng: lng })
        return true
    }
    return false
}

async function getCollectionsByOrigin(origin: string) {
    const raccolta = await Collection.find({ origin: origin }).sort("date").exec()
    return raccolta
}

async function addImage(b64: string, date: Date){
    const path = prefix + date.toISOString()
    let error = null
    await fs.writeFile(path, b64, { encoding: 'base64' }, function (err) {
        if (err) {
            error = err
        }
    })
    return error
}

async function returnImage(res: Response<any, Record<string, any>>, dateString: string) {
    res.sendFile(prefix + dateString)
}

export { connect, close, db, addUser, getUser, getUsers, updateUser, deleteUser, clear, User, generateHash, addCollection, getCollections, getCollectionByUser, deleteCollection, checkCollection, getOrigins, addOrigin, deleteOrigin, updateOrigin, getCollectionsByOrigin, checkOrigin, getOrigin, addImage, returnImage }