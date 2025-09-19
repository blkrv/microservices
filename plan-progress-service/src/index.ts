import appConfig from './config';
import express, { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { AppDataSource } from './data-source';
import workoutPlanRoutes from './routes/workout-plan.routes';
import planProgressRoutes from './routes/plan-progress.routes';
import exerciseProgressRoutes from './routes/exercise-progress.routes';
import workoutInPlanRoutes from './routes/workout-in-plan.routes';
import { CustomError } from './utils/custom-error.util';
import { connectRabbitMQ } from './config/rabbitmq'; // Import connectRabbitMQ

const app = express();
const PORT = appConfig.port;

app.use(express.json());

app.use('/plans', workoutPlanRoutes);
app.use('/plan-progress', planProgressRoutes);
app.use('/exercise-progress', exerciseProgressRoutes);
app.use('/workout-in-plan', workoutInPlanRoutes);

// Centralized error handler
const errorHandler: ErrorRequestHandler = (err: Error, req: Request, res: Response, next: NextFunction): void => {
  if (err instanceof CustomError) {
    console.error(`[${req.originalUrl}] Custom Error ${err.statusCode}: ${err.message}`);
    res.status(err.statusCode).json({ message: err.message });
    return;
  }

  // For all other errors (uncaught CustomError or unhandled)
  console.error(`[${req.originalUrl}] Unhandled Server Error:`, err);
  res.status(500).json({ message: 'An unexpected error occurred. Please try again later.' });
  return;
};

app.use(errorHandler);

AppDataSource.initialize()
  .then(async () => {  // Added async
    await connectRabbitMQ(); // Connect to RabbitMQ

    app.listen(PORT, () => {
      console.log(`Plan & Progress Service is running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.log('TypeORM connection error in Plan & Progress Service: ', error);
  });