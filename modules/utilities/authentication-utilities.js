const jwt = require('jsonwebtoken');

class AuthenticationUtilities {
    static createBearerToken(data, private_key) {
        return jwt.sign({
            exp: Math.floor(Date.now() / 1000) + (60 * 60),
            data,
        }, private_key);
    }

    static async validateToken(user, token) {
        const result = await user.findOne({
            where: {
                token,
            },
        });

        if (!result) { return null; }
        return result;
    }

    static validateIPAddress(request_ip, remote_access) {
        return remote_access.length > 0 && remote_access.includes(request_ip);
    }
}

module.exports = AuthenticationUtilities;
