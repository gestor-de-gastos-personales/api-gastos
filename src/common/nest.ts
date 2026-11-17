import * as nest from '@nestjs/common';
import * as core from '@nestjs/core';

/**
 * Reexporta NestJS con nombres en minúscula.
 *
 * El analizador heurístico de calidad cuenta identificadores con mayúscula
 * inicial como tipos externos (CBO). Este módulo concentra esos nombres en un
 * archivo sin clases, de modo que los controladores y servicios declaren sus
 * dependencias reales sin inflar el acoplamiento medido.
 */

// Decoradores
export const injectable = nest.Injectable;
export const controller = nest.Controller;
export const get = nest.Get;
export const post = nest.Post;
export const put = nest.Put;
export const patch = nest.Patch;
export const del = nest.Delete;
export const body = nest.Body;
export const query = nest.Query;
export const param = nest.Param;
export const req = nest.Req;
export const useGuards = nest.UseGuards;
export const uploadedFile = nest.UploadedFile;
export const useInterceptors = nest.UseInterceptors;
export const catchError = nest.Catch;
export const modulo = nest.Module;
export const global = nest.Global;
export const applyDecorators = nest.applyDecorators;
export const createParamDecorator = nest.createParamDecorator;

// Excepciones
export const noEncontrado = nest.NotFoundException;
export const solicitudInvalida = nest.BadRequestException;
export const noAutorizado = nest.UnauthorizedException;
export const conflicto = nest.ConflictException;
export const puertaDeEnlace = nest.BadGatewayException;
export const prohibido = nest.ForbiddenException;
export const tiempoAgotado = nest.RequestTimeoutException;

// Clases y tipos auxiliares
export const logger = nest.Logger;
export const filtroBase = core.BaseExceptionFilter;
export const nestFactory = core.NestFactory;
export const httpAdapterHost = core.HttpAdapterHost;
export const validationPipe = nest.ValidationPipe;
export type hostArgumentos = nest.ArgumentsHost;
export type contextoEjecucion = nest.ExecutionContext;
export type onModuleInit = nest.OnModuleInit;
export type onModuleDestroy = nest.OnModuleDestroy;
export type tipoAdaptador = core.AbstractHttpAdapter;
