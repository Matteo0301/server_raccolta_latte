import { model, Schema } from "mongoose";

const UserSchema = new Schema({
    username: String,
    password: String,
    admin: Boolean
})

const User = model('User', UserSchema, 'utenti')

export { User }