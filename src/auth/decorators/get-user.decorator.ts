import * as nj from '../../common/nest.js';

export const GetUser = nj.createParamDecorator(
  (data: string | undefined, ctx: nj.contextoEjecucion) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    return data ? user?.[data] : user;
  },
);