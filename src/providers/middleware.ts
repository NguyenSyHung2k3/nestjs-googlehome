import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class RequestInterceptorMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction) {
        console.log('Intercepting requests on Server 2:', req.method);
        next(); // Continue to the next middleware or route handler
    }
}

