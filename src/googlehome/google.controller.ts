import { All, Controller, Next, Post, Redirect, Req, Res } from "@nestjs/common";
import { GoogleService } from "./google.service";
import { Request, Response } from "express";
import { SmartHomeV1Request, SmartHomeV1Response } from "actions-on-google";

@Controller()
export class GoogleController {
    constructor(private readonly googleService: GoogleService) { }

    @Post('/smarthome')
    async handleFulfillment(@Req() req: Request, @Res() res: Response) {
        console.log("Intercepting smarthome requests postsmarthome ...");
        try {
            console.log(this.googleService.getApp());
            return this.googleService.getApp();
        } catch (error) {
            console.error("Error processing Smart Home request:", error);
        }
    }

    @All('/*')
    async handleAll(@Req() req: Request, @Res() res: Response) {
        console.log("Intercepting smarthome requests ...", req.method);
        if (!res.headersSent) {
            res.send('Request smarthome intercepted and handled');
        }
    }

    
}
