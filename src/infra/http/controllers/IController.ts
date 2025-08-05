export type ControllerInput<
  TParams = any,
  TQuery = any,
  TBody = any,
  THeaders = any,
  TUser = any
> = {
  params?: TParams;
  query?: TQuery;
  body?: TBody;
  headers?: THeaders;
  user?: TUser;
};

export type ControllerOutput<Data = any> = {
  statusCode: number;
  message?: string;
  data?: Data;
};

export interface IController<
  Input extends ControllerInput = ControllerInput,
  Output extends ControllerOutput = ControllerOutput
> {
  handle(input: Input): Promise<Output>;
}
