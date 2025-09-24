import appConfig from './config';
import express, { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { AppDataSource } from './data-source';
import blogPostRoutes from './routes/blog-post.routes';
import { CustomError } from './utils/custom-error.util';
import { connectRabbitMQ } from './config/rabbitmq';

const app = express();
const PORT = appConfig.port;

app.use(express.json());

app.use('/blog-posts', blogPostRoutes);


const errorHandler: ErrorRequestHandler = (err: Error, req: Request, res: Response, next: NextFunction): void => {
  if (err instanceof CustomError) {
    console.error(`[${req.originalUrl}] Custom Error ${err.statusCode}: ${err.message}`);
    res.status(err.statusCode).json({ message: err.message });
    return;
  }

 
  console.error(`[${req.originalUrl}] Unhandled Server Error:`, err);
  res.status(500).json({ message: 'An unexpected error occurred. Please try again later.' });
  return;
};

app.use(errorHandler);

AppDataSource.initialize()
  .then(async () => {
    await connectRabbitMQ();

    app.listen(PORT, () => {
      console.log(`Blog Service is running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => console.log('TypeORM connection error in Blog Service: ', error));