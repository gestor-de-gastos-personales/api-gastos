import * as nj from './common/nest.js';
import { LoggerModule } from 'nestjs-pino';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { crearOpcionesLogger } from './common/logger/opciones-logger.js';
import { MODULOS_FEATURE } from './modules.js';

@nj.modulo({
  imports: [
    LoggerModule.forRoot(crearOpcionesLogger()),
    ScheduleModule.forRoot(),
    ...MODULOS_FEATURE,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
