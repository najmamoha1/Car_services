const crypto = require('crypto')


//Function to encrypt Emails
function EncEmail(email) {
    let cipher = crypto.createCipher(process.env.algorithm, process.env.email_password);
    let hash = cipher.update(email, 'utf8', 'hex')
    hash += cipher.final('hex');
    return hash
}

//Function to decrypt Emails
function decEmail(encryptedEmail) {
    var mykey = crypto.createDecipher(process.env.algorithm, process.env.email_password);
    var mystr = mykey.update(encryptedEmail, 'hex', 'utf8')
    mystr += mykey.final('utf8');
    return mystr
}


//Function to encrypt Passwords
function EncPass(password) {
    let cipher = crypto.createCipher(process.env.algorithm, process.env.password_password);
    let hash = cipher.update(password, 'utf8', 'hex')
    hash += cipher.final('hex');
    return hash
}

//Function to decrypt Password
function decPassword(encryptedPassword) {
    var mykey = crypto.createDecipher(process.env.algorithm, process.env.password_password);
    var mystr = mykey.update(encryptedPassword, 'hex', 'utf8')
    mystr += mykey.final('utf8');
    return mystr
}


// Export each functions
module.exports = {
    decEmail: decEmail,
    EncEmail: EncEmail,
    decPassword: decPassword,
    EncPass: EncPass
}