import { All, Controller, Next, Post, Req, Res } from "@nestjs/common";
import { GoogleService } from "./google.service";
import { Request, Response } from "express";
import { smarthome } from "actions-on-google";

@Controller('/smarthome')
export class GoogleController {
    constructor(private readonly googleService: GoogleService){}

    @Post('/fulfillment')
    async handleFulfillment(@Req() req: Request, @Res() res: Response){
        console.log("Intercepting smarthome requests ...",req.method);
        const app = this.googleService.getApp();
        app(req, res);
    }

    @All('/*')
    async handleAll(@Req() req: Request, @Res() res: Response){
        console.log("Intercepting smarthome requests ...",req.method);
        res.send('Request smarthome intercepted and handled')
    }
}