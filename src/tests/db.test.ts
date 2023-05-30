import { addUser, close, connect, getUser, getUsers, updateUser } from "../lib/mongoose";
import { User } from "../lib/schemas";


require("dotenv").config()

const CONNECTION_STRING = process.env.CONNECTION_STRING || "mongodb://user:password@mongodb:27017/raccolta_latte?authSource=raccolta_latte"
const DATABASE = process.env.DATABASE || 'raccolta_latte'
const port = process.env.PORT




describe("Users", () => {

    beforeAll(async () => {
        await connect(CONNECTION_STRING);
    })

    afterAll(async () => {
        await close()
    })

    it("Get users", async () => {
        let users = await getUsers()
        expect(users).toMatchSnapshot()
    })

    it("Add users", async () => {
        await addUser("test", "test", false)
        let users = await getUser("test")
        expect(users).not.toBeNull()
        if (users)
            expect(users.admin).toBeFalsy()
    })

    it("Update users", async () => {
        await updateUser("test", "test", true)
        let users = await getUser("test")
        expect(users).not.toBeNull()
        if (users)
            expect(users.admin).toBeTruthy()
    })

    it("Delete users", async () => {
        await User.deleteOne({ username: "test" }).exec()
        let users = await getUser("test")
        expect(users).toBeNull()
    })


})