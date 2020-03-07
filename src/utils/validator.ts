import { HttpError, ErrorCode, HttpStatusCode } from './httperror';
export default class Validator {
    static validateParameter(param: any, paramName: string) {
        if (!param) {
            throw new HttpError("invalid params " + paramName + ": " + param, ErrorCode.Bad_Parameter, HttpStatusCode.BadRequest)
        }
    }

}