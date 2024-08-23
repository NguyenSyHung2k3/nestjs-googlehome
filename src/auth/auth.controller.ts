import { Controller, Post, Req, Res, Get, All } from "@nestjs/common";
import { Request, Response } from "express";
import { AuthService } from "./auth.service";

@Controller('auth')
export class AuthController {

    constructor(private readonly authService: AuthService) {}

    @Get('/login')
    async getLogin(@Req() req: Request, @Res() res: Response){
        console.log('Intercepting response ...',req.method, req.url);
        const responseurl = req.query.responseurl as string;
        const loginPage = this.authService.login(responseurl);
        res.send(loginPage);
    }

    @Post('/login')
    async postLogin(@Req() req: Request, @Res() res: Response){
        console.log('Requesting login page', req.body);
        const responseurl = decodeURIComponent(req.body.responseurl);
        console.log(`Redirect to ${responseurl}`);
        return res.redirect(responseurl);
    }

    @All('/faketoken')
    async handleFakeAuth(@Req() req: Request, @Res() res: Response): Promise<any>{
        console.log('Intercepting requests ...',req.query);
        console.log('Intercepting body ...',req.body);
        console.log('Intercepting header ...',req.headers);

        const responseurl = this.authService.handleFakeAuth(req.query.redirect_uri as string, req.query.state as string);
        console.log(`Set redirect as ${responseurl}`);
        return res.redirect(`/login?responseurl=${encodeURIComponent(await responseurl)}`)
    }

    @All('/faketoken')
    async handleFakeToken(@Req() req: Request, @Res() res: Response){
        const HTTP_STATUS_OK = 200;
        console.log('Intercepting requests ...',req.query);
        console.log('Intercepting body ...',req.body);
        console.log('Intercepting header ...',req.headers);

        const grantType = req.query.grant_type ? req.query.grant_type : req.body.grant_type;
        const tokenResponse = this.authService.handleFakeToken(grantType);
        return res.status(HTTP_STATUS_OK).json(tokenResponse);

    }

    @All('/*')
    async handleAllRequest(@Req() req: Request, @Res() res: Response, next: () => void){
        console.log('Intercepting requests on Server 2:', req.method);
        next();
    }
}