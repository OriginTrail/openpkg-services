const fs = require('fs');

class Utilities {
    readFile(path) {
        return fs.readFileSync(path);
    }

    writeFile(path, content) {
        fs.writeFileSync(path, content);
    }

    static async sleepForMilliseconds(timeout) {
        await new Promise((resolve, reject) => {
            setTimeout(() => resolve(), timeout);
        });
    }
}

module.exports = Utilities;
