/**
 * TODO: 8.4 Register new user
 *       - Handle registration form submission
 *       - Prevent registration when password and passwordConfirmation do not match
 *       - Use createNotification() function from utils.js to show user messages of
 *       - error conditions and successful registration
 *       - Reset the form back to empty after successful registration
 *       - Use postOrPutJSON() function from utils.js to send your data back to server
 */

const button = document.getElementById('btnRegister');
const form = document.getElementById('register-form');
const MIN_PASS_LENGTH = 10;

/**
 * Handles registration
 * 
 * @param {*} event event activated by clicking register button
 */
const register = async event => {
    event.preventDefault();

    const newName = document.getElementById('name').value;
    const newEmail = document.getElementById('email').value;
    const newPassword = document.getElementById('password').value;
    const newPasswordConf = document.getElementById('passwordConfirmation').value;

    let errorMsg = "";

    if (newName.length === 0) errorMsg = "Missing name";
    else if (newEmail.length === 0) errorMsg = "Missing email";
    else if (newPassword.length === 0) errorMsg = "Missing password";
    else if (newPassword !== newPasswordConf) errorMsg = "Passwords don't match";
    else if (newPassword.length < MIN_PASS_LENGTH) errorMsg = "Password is too short";

    if (errorMsg.length > 0) {
        createNotification(errorMsg, 'notifications-container', false);
    }
    else {
        try {
            const newPerson = { name: newName, email: newEmail, password: newPassword };
            await postOrPutJSON('/api/register', 'POST', newPerson);
            createNotification('Registration successful!', 'notifications-container', true);
            // reset the form to its initial state
            form.reset();
        } catch (e) {
            // The remaining possible error is that the email is already in use
            createNotification('Email address is already registered', 'notifications-container', false);
        }
    }
};

button.addEventListener('click', register);