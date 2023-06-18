import { connect, close } from '../lib/mongoose'



beforeAll(async () => {
    // put your client connection code here, example with mongoose:
    await connect(process.env['MONGO_URI'] as string)

});

afterAll(async () => {
    // put your client disconnection code here, example with mongodb:
    await close()
});