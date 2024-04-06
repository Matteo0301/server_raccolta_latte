import { addUser, clear, close, connect, getUser, getUsers, updateUser } from "../lib/mongoose";
import { User } from "../lib/schemas";


require("dotenv").config()

describe("Users", () => {

    beforeAll(async () => {
        await clear()
    })

    test("Get users", async () => {
        let users = await getUsers()
        expect(users.toString()).toBe("")
    })

    test("Add users", async () => {
        await addUser("test", "test", false)
        let users = await getUser("test")
        expect(users).not.toBeNull()
        if (users)
            expect(users.admin).toBeFalsy()
    })

    test("Update users", async () => {
        await updateUser("test", "test 2", "test", true)
        let users = await getUser("test 2")
        expect(users).not.toBeNull()
        if (users)
            expect(users.admin).toBeTruthy()
    })

    test("Delete users", async () => {
        await User.deleteOne({ username: "test" }).exec()
        let users = await getUser("test")
        expect(users).toBeNull()
    })


})