'use strict';

const Service = require('egg').Service;

class TokenService extends Service {
    /**
     * 生成 Token
     * @param {Object} data
     */
   async  createToken(data) {
        return app.jwt.sign(data, app.config.jwt.secret, {
            expiresIn: "12h"
        });
    }

    /**
     * 验证token的合法性
     * @param {String} token
     */
    async verifyToken(token) {
        return new Promise((resolve, reject) => {
            this.ctx.app.jwt.verify(token, this.ctx.app.config.jwt.secret, function (err, decoded) {
                let result = {};
                if (err) {
                    /*
                      err = {
                        name: 'TokenExpiredError',
                        message: 'jwt expired',
                        expiredAt: 1408621000
                      }
                    */
                    result.verify = false;
                    result.message = err.message;
                } else {
                    result.verify = true;
                    result.message = decoded;
                }
               /* { verify: true,
                    message:
                     { uid: '6d1331b362ad4b7eaaa5449d7abba839',
                       loginDate: '2018-7-23 17:07:41',
                       iat: 1532336861,
                       exp: 1532423261 } }*/
                resolve(result);
            });
        });
    }
}

module.exports = TokenService;
