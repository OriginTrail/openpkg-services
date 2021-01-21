const authenticationUtilities = require('./authentication-utilities');
const args = process.argv.slice(2);

if (!args[0]){
    console.error('Usage: node generate-token.rs <secret>');
    return;
}

console.log(authenticationUtilities.createBearerToken('demo@origin-trail.com', args[0]));