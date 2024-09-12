import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class RequestInterceptorMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction) {
        console.log('Intercepting requests on Server 2:', req.method);
        next(); // Continue to the next middleware or route handler
    }
}

@Injectable()
export class RedirectMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction) {
      // Check if the current port is 3000 and redirect to 8080
      if (req.headers.host?.includes('3000')) {
        const newUrl = `https://crispy-sniffle-7v9544ggg6v52p466-5000.app.github.dev/`;
        return res.redirect(newUrl);
      }
      next();
    }
}