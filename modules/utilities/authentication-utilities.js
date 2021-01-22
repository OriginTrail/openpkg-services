const jwt = require('jsonwebtoken');

class AuthenticationUtilities {
    static createBearerToken(data, private_key) {
        return jwt.sign({
            data,
        }, private_key);
    }

    static async validateToken(user, token, secret) {
        try{
            jwt.verify(token, secret);
            const result = await user.findOne({
                where: {
                    token,
                },
            });

            if (result){
                return result;
            }
        } catch (e)
        {
            return null;
        }

        return null;
    }

    static validateIPAddress(request_ip, remote_access) {
        return remote_access.length > 0 && remote_access.includes(request_ip);
    }
}

module.exports = AuthenticationUtilities;
