const puppeteer = require('puppeteer');
const http = require('http');
const chai = require('chai');
const expect = chai.expect;
const chaiHttp = require('chai-http');
const { handleRequest } = require('../../routes');
chai.use(chaiHttp);

const User = require('../../models/user');

// helper function for creating randomized test data
const generateRandomString = (len = 9) => {
    let str = '';

    do {
        str += Math.random().toString(36).substr(2, 9).trim();
    } while (str.length < len);

    return str.substr(0, len);
};

const users = require('../../setup/users.json').map(user => ({ ...user }));
const adminUser = { ...users.find(u => u.role === 'admin') };

describe('UI: Register test', function () {
    let server;
    let page;
    let browser;
    const notificationSelector = '#notifications-container';
    const notifyMsg = 'Missing ';

    const getTestUser = () => {
        return {
            name: generateRandomString(),
            email: `${generateRandomString()}@email.com`,
            password: generateRandomString(10)
        };
    };

    before(async () => {
        server = http.createServer(handleRequest);
        server.listen(3000, () => {
            const port = server.address().port;
            baseUrl = `http://localhost:${port}`;
        });
        browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--disable-dev-shm-usage']
        });
        page = await browser.newPage();

        registrationPage = `${baseUrl}/register.html`;

        await User.deleteMany({});
        await User.create(users);
    });

    after(() => {
        server && server.close();
        browser && browser.close();
    });
    it('should prevent and notify registration with empty name', async () => {
        const errorType = 'name';

        await page.goto(registrationPage, { waitUntil: 'networkidle0' });
        await page.click('#btnRegister');

        const notificationText = await page.$eval(notificationSelector, elem =>
            elem.textContent.trim()
        );
        expect(notificationText).to.equal(notifyMsg + errorType);
    });
    it('should prevent and notify registration with empty email', async () => {
        const newCustomer = getTestUser();
        const errorType = 'email';

        await page.goto(registrationPage, { waitUntil: 'networkidle0' });
        await page.type('#name', newCustomer.name, { delay: 20 });
        await page.click('#btnRegister');

        const notificationText = await page.$eval(notificationSelector, elem =>
            elem.textContent.trim()
        );
        expect(notificationText).to.equal(notifyMsg + errorType);
    });
    it('should prevent and notify registration with empty passwords', async () => {
        const newCustomer = getTestUser();
        const errorType = 'password';

        await page.goto(registrationPage, { waitUntil: 'networkidle0' });
        await page.type('#name', newCustomer.name, { delay: 20 });
        await page.type('#email', newCustomer.email, { delay: 20 });
        await page.click('#btnRegister');

        const notificationText = await page.$eval(notificationSelector, elem =>
            elem.textContent.trim()
        );
        expect(notificationText).to.equal(notifyMsg + errorType);
    });
    it('should prevent and notify registration with short password', async () => {
        const newCustomer = getTestUser();
        newCustomer.password = newCustomer.password.slice(0,9);

        await page.goto(registrationPage, { waitUntil: 'networkidle0' });
        await page.type('#name', newCustomer.name, { delay: 20 });
        await page.type('#email', adminUser.email, { delay: 20 });
        await page.type('#password', newCustomer.password, { delay: 20 });
        await page.type('#passwordConfirmation', newCustomer.password, { delay: 20 });
        await page.click('#btnRegister');

        const notificationText = await page.$eval(notificationSelector, elem =>
            elem.textContent.trim()
        );
        expect(notificationText).to.equal("Password is too short");
    });
    it('should prevent and notify registration with existing email', async () => {
        const newCustomer = getTestUser();

        await page.goto(registrationPage, { waitUntil: 'networkidle0' });
        await page.type('#name', newCustomer.name, { delay: 20 });
        await page.type('#email', adminUser.email, { delay: 20 });
        await page.type('#password', newCustomer.password, { delay: 20 });
        await page.type('#passwordConfirmation', newCustomer.password, { delay: 20 });
        await page.click('#btnRegister');

        const notificationText = await page.$eval(notificationSelector, elem =>
            elem.textContent.trim()
        );
        expect(notificationText).to.equal("Email address is already registered");
    });
});
describe('NewUser values', function () {
    it('', async () => {});
});