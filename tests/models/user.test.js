import TestsHelpers from "../test-helpers";
import models from "../../src/models";
import user from "../../src/models/user";

describe("User", () => {
    beforeAll(async () => {
        await TestsHelpers.startDb();
    })

    afterAll(async () => {
        await TestsHelpers.stopDb();
    })

    describe('static methods', () => {
        describe('hashPassword', () => {
            it('should encrypt password', async () => {
                const { User } = models;
                const password = 'test123#'
                const hashedPassword = await User.hashPassword(password);

                expect(hashedPassword).toEqual(expect.any(String));
                expect(hashedPassword).not.toEqual(password)
            })
        })

        describe('compare passwords', () => {
            it('returns true if passwords are equal', async () => {
                const { User } = models;
                const password = 'test123#';
                const hashedPassword = await User.hashPassword(password);
                const arePasswordsEqual = await User.comparePasswords(password, hashedPassword);
                expect(arePasswordsEqual).toBe(true);
            })

            it('returns false if passwords are not equal', async () => {
                const { User } = models;
                const password = 'test123#';
                const hashedPassword = await User.hashPassword(password);
                const arePasswordsEqual = await User.comparePasswords(password, hashedPassword);
                expect(arePasswordsEqual).toBe(true);
            })
        })
    })

    describe('hooks', () => {
        beforeEach(async () => { await TestsHelpers.syncDb() })
        it("should create an user", async () => {
            const { User } = models;
            const username = 'testuser';
            const email = "mail@mail.com";
            const password = 'test123#';

            await User.create({ username, email, password });
            const users = await User.findAll();

            expect(users.length).toBe(1);
            expect(users[0].username).toEqual(username);
            expect(users[0].email).toEqual(email);
            expect(users[0].password).not.toEqual(password);
        })
    })
})