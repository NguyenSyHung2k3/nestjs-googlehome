import { Module, NestModule } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { MiddlewareConsumer } from "@nestjs/common";
import { RequestInterceptorMiddleware } from "src/providers/middleware";
import { GoogleService } from "src/googlehome/google.service";

@Module({
    controllers: [AuthController],
    providers: [AuthService, GoogleService],
})
export class AuthModule{
}