import { Controller, Post, Req, Res } from "@nestjs/common";
import { GoogleService } from "./google.service";
import { Request, Response } from "express";

@Controller({})
export class GoogleController {
    constructor(private readonly googleService: GoogleService){}

    @Post('/fulfillment')
    async handleFulfillment(@Req() req: Request, @Res() res: Response){
        const app = this.googleService.getApp();
        app(req, res);
    }
}