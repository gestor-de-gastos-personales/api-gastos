import * as nj from '../common/nest.js';
import { PrismaClient } from '@prisma/client';

@nj.injectable()
export class PrismaService extends PrismaClient implements nj.onModuleInit, nj.onModuleDestroy {
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}