import { model, Schema } from "mongoose";

const UserSchema = new Schema({
    username: String,
    password: String,
    admin: Boolean
})

const RaccoltaSchema = new Schema({
    date: Date,
    quantity: Number,
    user: String
})

const User = model('User', UserSchema, 'utenti')
const Raccolta = model('Raccolta', RaccoltaSchema, 'raccolta')

export { User, Raccolta }