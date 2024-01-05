import { model, Schema } from "mongoose";

const UserSchema = new Schema({
    username: { type: String, index: true, unique: true },
    password: String,
    admin: Boolean
}, {
    toJSON: {
        transform: function (doc, ret) {
            delete ret._id;
        }
    }
})

const OriginSchema = new Schema({
    name: { type: String, index: true, unique: true },
}, {
    toJSON: {
        transform: function (doc, ret) {
            delete ret._id;
        }
    }
})

const CollectionSchema = new Schema({
    date: Date,
    origin: String,
    quantity: Number,
    quantity2: Number,
    user: String
}, {
    toJSON: {
        transform: function (doc, ret) {
            //delete ret._id;
            delete ret.__v;
        }
    }
})

const User = model('User', UserSchema, 'utenti')
const Collection = model('Raccolta', CollectionSchema, 'raccolta')
const Origins = model('Origin', OriginSchema, 'conferenti')

export { User, Collection, Origins }