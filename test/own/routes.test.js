const chai = require('chai');
const expect = chai.expect;
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
const User = require('../../models/user');

const { handleRequest } = require('../../routes');

const usersUrl = '/api/users';
const contentType = 'application/json';

// helper function for authorization headers
const encodeCredentials = (username, password) =>
    Buffer.from(`${username}:${password}`, 'utf-8').toString('base64');

// Get users (create copies for test isolation)
const users = require('../../setup/users.json').map(user => ({ ...user }));

const adminUser = { ...users.find(u => u.role === 'admin') };


const adminCredentials = encodeCredentials(adminUser.email, adminUser.password);

describe('handleRequest()', () => {
    let url;
    const user = {
        role: 'admin'
    };

    beforeEach(async () => {
        await User.deleteMany({});
        await User.create(users);
        allUsers = await User.find({});
        const tempUser = users.find(u => u.role === 'admin' && u.email !== adminUser.email);
        const testUser = await User.findOne({ email: adminUser.email }).exec();
        url = `${usersUrl}/${testUser.id}`;
    });
    it('should respond with "404 Not found" to incorrect url', async () => {
        const response = await chai.request(handleRequest).options(usersUrl + "error");
        expect(response).to.have.status(404);
    });
    it('should respond with "400 Bad request" when admin tries to delete itself', async () => {
        const response = await chai
            .request(handleRequest)
            .delete(url)
            .set('Accept', contentType)
            .set('Authorization', `Basic ${adminCredentials}`);
        expect(response).to.have.status(400);
    });
    it('should respond with "400 Bad request" when admin tries to set itself to customer', async () => {
        const response = await chai
            .request(handleRequest)
            .put(url)
            .set('Accept', contentType)
            .set('Authorization', `Basic ${adminCredentials}`)
            .send(user);
        expect(response).to.have.status(400);
    });
});