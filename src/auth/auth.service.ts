import { Injectable } from "@nestjs/common";
import * as util from 'util';
const { google } = require("googleapis")

@Injectable({})
export class AuthService {
    constructor() { }

    private auth = new google.auth.GoogleAuth({
        keyFilename: 'smart-home-key.json',
        scopes: ['https://www.googleapis.com/auth/homegraph'],
    });

    private homegraph = google.homegraph({
        version: 'v1',
        auth: this.auth,
    });



    login = async (responseurl: string) => {
        return `
        <html>
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <body>
            <form action="/login" method="post">
                <input type="text" name="responseurl" value="${responseurl}" />
                <button type="submit" style="font-size:14pt">
                Link this service to Google
                </button>
            </form>
            </body>
        </html>
        `
    }

    handleFakeAuth = async (redirectUri: string, state: string) => {
        return util.format('%s?code=%s&state=%s',
            decodeURIComponent(redirectUri), '123456',
            state);
    }

    handleFakeToken = async (grantType: string) => {
        const secondsInDay = 86400;
        if (grantType === 'authorization_code') {
            return {
                token_type: 'bearer',
                access_token: '123access',
                refresh_token: '123refresh',
                expires_in: secondsInDay,
            }
        } else if (grantType === 'refresh_token') {
            return {
                token_type: 'bearer',
                access_token: '123access',
                expires_in: secondsInDay,
            }
        }
        return null;
    }
}
