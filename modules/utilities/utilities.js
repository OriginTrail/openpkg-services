const fs = require('fs');

class Utilities {
    readFile(path) {
        return fs.readFileSync(path);
    }

    writeFile(path, content) {
        fs.writeFileSync(path, content);
    }
}

module.exports = Utilities;
