import { Module, NestModule, OnModuleInit } from "@nestjs/common";
import { GoogleService } from "./google.service";
import { GoogleController } from "./google.controller";
import { MiddlewareConsumer } from "@nestjs/common";
import { RequestInterceptorMiddleware } from "src/providers/middleware";

@Module({
    controllers: [GoogleController],
    providers: [GoogleService]
})
export class GoogleModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(RequestInterceptorMiddleware)
            .forRoutes('*');  // Apply to all routes
    }
}


