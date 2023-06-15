import { addUser, close, connect, getUser, getUsers, updateUser } from "../lib/mongoose";
import { User } from "../lib/schemas";


require("dotenv").config()

describe("Users", () => {

    test("Get users", async () => {
        let users = await getUsers()
        console.log('users :>> ', users);
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
        await updateUser("test", "test", true)
        let users = await getUser("test")
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