import crypto from "crypto";

export class Keygen {
    /**
     * Return a unique identifier with the given `len`.
     *
     *     utils.uid(10);
     *     // => "FDaS435D2z"
     *
     * @param {Number} len
     * @return {String}
     * @api private
     */
    public static uid(len: number): string {
        let buf = [];
        let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let length = chars.length;

        for (let i = 0; i < len; ++i) {
            buf.push(chars[this.getRandomInt(0, length - 1)]);
        }

        return buf.join('');
    }

    public static numericSimpleUid(len: number, numUniqueDigits: number): string {
        let chars = '123456789';
        const subset = this.getRandomSubstring(chars, numUniqueDigits);
        let length = subset.length;

        const buf = [];
        for (let i = 0; i < len; ++i) {
            buf.push(subset[this.getRandomInt(0, length - 1)]);
        }

        return buf.join('');
    }

    /**
     * Return a unique identifier with the given `len`.
     *
     *     utils.uid(10);
     *     // => "FDaS435D2z"
     *
     * @param {Number} len
     * @return {String}
     * @api private
     */
    public static hexUid(len: number): string {
        let buf = [];
        let chars = 'ABCDEF0123456789';
        let length = chars.length;

        for (let i = 0; i < len; ++i) {
            buf.push(chars[this.getRandomInt(0, length - 1)]);
        }

        return buf.join('');
    }

    /**
     * Create a HMAC using SHA512
     *
     * @param {String} key - encryption key
     * @param {String} message - message to be encrypted
     * @return {String} encrypted HMAC
     */
    public static hmacSHA512(key: string, message: string): Promise<string> {
        const crypto = require('crypto');
        return new Promise((resolve, reject) => {
            if (message === null || message === undefined) {
                reject('hmacSHA512 input message was null or undefined.');
            } else if (key === null || key === undefined) {
                reject('hmacSHA512 input key was null or undefined.');
            } else {
                const buf = new Buffer(key, 'utf-8');
                let hash = crypto.createHmac('sha512', buf);
                hash.update(new Buffer(message, 'utf-8'));
                resolve(hash.digest('hex'));
            }
        });
    }

    public static getRandomElements<T>(arr: Array<T>, count: number, unique: boolean): Array<T> {
        const result: Array<T> = [];
        if (!unique) {
            for (let ii=0; ii<count; ii+=1) {
                result.push(arr[this.getRandomInt(0, arr.length - 1)]);
            }
        } else {
            // if (count > arr.length) {
            //     throw {code: 500, error: 'Cannot build random unique array longer than length longer than original: ' + count + ', ' + arr.length};
            // }
            if (count > arr.length) {
                count = arr.length;
            }
            const remainingItems: Array<T> = [];
            arr.forEach(item => remainingItems.push(item));
            while (result.length < count) {
                const index = this.getRandomInt(0, remainingItems.length - 1);
                result.push(remainingItems[index]);
                remainingItems.splice(index, 1);
            }
        }
        return result;
    }

    public static getRandomElement<T>(arr: Array<T>): T | undefined {
        if (!arr || arr.length === 0) {
            return undefined;
        }
        return arr[this.getRandomInt(0, arr.length - 1)];
    }

    public static getRandomInt(min: number, max: number) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    public static getRandomSubstring(value: string, size: number) {
        const array = Array.from(value);
        return this.getRandomSubarray(array, size);
    }

    public static getRandomSubarray(arr: Array<any>, size: number) {
        const shuffled = arr.slice(0);
        let i = arr.length;
        let temp;
        let index;
        while (i--) {
            index = Math.floor((i + 1) * Math.random());
            temp = shuffled[index];
            shuffled[index] = shuffled[i];
            shuffled[i] = temp;
        }
        return shuffled.slice(0, size);
    }
}
