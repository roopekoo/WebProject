const chai = require('chai');
const expect = chai.expect;
const puppeteer = require('puppeteer');
const http = require('http');
const { handleRequest } = require('../../routes');

const User = require('../../models/user');

// Get users (create copies for test isolation)
const users = require('../../setup/users.json').map(user => ({ ...user }));

const adminUser = { ...users.find(u => u.role === 'admin') };

const encodeCredentials = (username, password) =>
  Buffer.from(`${username}:${password}`, 'utf-8').toString('base64');

const getHeaders = user => {
    return { Authorization: `Basic ${encodeCredentials(user.email, user.password)}` };
};

describe('UI: Cart test', function () {
    let server;
    let browser;
    const notificationSelector = '#notifications-container';
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

        cartPage = `${baseUrl}/cart.html`;
        
        await User.deleteMany({});
        await User.create(users);

        await page.setExtraHTTPHeaders(getHeaders(adminUser));
    });
    after(() => {
        server && server.close();
        browser && browser.close();
    });
    it('should prevent and notify ordering with empty cart', async () => {
        const errorType = 'Name';

        await page.goto(cartPage, { waitUntil: 'networkidle0' });
        await page.click('#place-order-button');

        const notificationText = await page.$eval(notificationSelector, elem =>
            elem.textContent.trim()
        );
        expect(notificationText).to.equal("The cart is empty!");
    });
});