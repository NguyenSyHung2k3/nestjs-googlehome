import { Module, NestModule } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { MiddlewareConsumer } from "@nestjs/common";
import { GoogleService } from "src/googlehome/google.service";
import { RequestInterceptorMiddleware } from "src/providers/middleware";

@Module({
    controllers: [AuthController],
    providers: [AuthService],
})
export class AuthModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(RequestInterceptorMiddleware)
            .forRoutes('*');  // Apply to all routes
    }
}