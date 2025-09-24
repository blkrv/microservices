import { AppDataSource } from '../data-source';
import { WorkoutPlan } from '../models/WorkoutPlan';
import { UserServiceClient } from '../clients/user.service.client';
import { CustomError } from '../utils/custom-error.util';
import { publishToQueue } from '../config/rabbitmq';

export class WorkoutPlanService {
  private workoutPlanRepository = AppDataSource.getRepository(WorkoutPlan);
  private userServiceClient: UserServiceClient;

  constructor() {
    this.userServiceClient = new UserServiceClient();
  }

  async getAllMyWorkoutPlans(userId: number): Promise<WorkoutPlan[]> {
    return this.workoutPlanRepository.find({
      where: { user_id: userId },
    });
  }

  async getAllWorkoutPlans(): Promise<WorkoutPlan[]> {
    return this.workoutPlanRepository.find();
  }

  async getWorkoutPlanById(id: number): Promise<WorkoutPlan> {
    const workoutPlan = await this.workoutPlanRepository.findOne({
      where: { plan_id: id },
      relations: ['workoutInPlans'],
    });
    if (!workoutPlan) {
      throw new CustomError('Workout plan not found', 404);
    }
    return workoutPlan;
  }

  async createWorkoutPlan(workoutPlanData: Partial<WorkoutPlan>): Promise<WorkoutPlan> {
    if (!workoutPlanData.user_id || !workoutPlanData.name) {
      throw new CustomError('Missing required fields: user_id, name', 400);
    }

    // Проверка user_id через клиент
    const { user_id } = workoutPlanData;
    const userExists = await this.userServiceClient.doesUserExist(user_id);
    if (!userExists) {
      throw new CustomError(`User with ID ${user_id} does not exist.`, 400);
    }

    // Проверка уникальности имени плана для данного пользователя
    const existingPlanWithName = await this.workoutPlanRepository.findOne({
      where: { user_id: user_id, name: workoutPlanData.name }
    });
    if (existingPlanWithName) {
      throw new CustomError(`Workout plan with name "${workoutPlanData.name}" already exists for this user.`, 409);
    }

    const workoutPlan = this.workoutPlanRepository.create(workoutPlanData);
    return this.workoutPlanRepository.save(workoutPlan);
  }

  async updateWorkoutPlan(id: number, workoutPlanData: Partial<WorkoutPlan>): Promise<WorkoutPlan> {
    try {
      const workoutPlan = await this.workoutPlanRepository.findOne({
        where: { plan_id: id },
        relations: ['workoutInPlans'],
      });

      if (!workoutPlan) {
        throw new CustomError('Workout plan not found', 404);
      }

      // Проверка user_id при обновлении, если user_id меняется
      const { user_id } = workoutPlanData;
      if (user_id && user_id !== workoutPlan.user_id) {
        const userExists = await this.userServiceClient.doesUserExist(user_id);
        if (!userExists) {
          throw new CustomError(`User with ID ${user_id} does not exist.`, 400);
        }
      }


      if (workoutPlanData.name && workoutPlanData.name !== workoutPlan.name) {
        const existingPlanWithName = await this.workoutPlanRepository.findOne({
          where: { user_id: workoutPlan.user_id, name: workoutPlanData.name }
        });
        if (existingPlanWithName && existingPlanWithName.plan_id !== workoutPlan.plan_id) {
          throw new CustomError(`Workout plan with name "${workoutPlanData.name}" already exists for this user.`, 409);
        }
      }

      // Сохраняем старые данные плана для сравнения
      const oldWorkoutPlan = { ...workoutPlan };

      this.workoutPlanRepository.merge(workoutPlan, workoutPlanData);
      const updatedWorkoutPlan = await this.workoutPlanRepository.save(workoutPlan);

      // Определяем, какие поля были изменены
      const updatedFields: any = {};
      for (const key in workoutPlanData) {
        if (workoutPlanData.hasOwnProperty(key)) {
          const typedKey = key as keyof WorkoutPlan;
          const workoutPlanDataValue = workoutPlanData[typedKey];


          if (workoutPlanDataValue !== undefined && oldWorkoutPlan[typedKey] !== workoutPlanDataValue) {
            updatedFields[key] = workoutPlanDataValue;
          }
        }
      }

 
      const workoutIds = workoutPlan.workoutInPlans.map(workoutInPlan => workoutInPlan.workout_id);

      // Формируем сообщение для RabbitMQ
      const message = {
        planId: id,
        userId: workoutPlan.user_id,
        workoutIds: workoutIds,
        updatedFields: updatedFields,
      };

 
      const published = await publishToQueue('plan_events', 'plan.updated', message);

      if (published) {
        console.log(`[workout-plan-service] Published plan.updated event for plan ID: ${id}`);
      } else {
        console.error(`[workout-plan-service] Failed to publish plan.updated event for plan ID: ${id}`);
      }

      return updatedWorkoutPlan;
    } catch (error) {
      console.error('Error updating workout plan:', error);
      throw error;
    }
  }

  async deleteWorkoutPlan(id: number): Promise<boolean> {
    const workoutPlanToDelete = await this.workoutPlanRepository.findOneBy({ plan_id: id });
    if (!workoutPlanToDelete) {
      throw new CustomError('Workout plan not found', 404);
    }
    const result = await this.workoutPlanRepository.delete(id);
    return !!result.affected;
  }
}