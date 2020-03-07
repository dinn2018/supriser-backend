
class HttpError extends Error {
    message: string
    code: ErrorCode
    statusCode: HttpStatusCode
    constructor(message: string, code: ErrorCode, statusCode: HttpStatusCode) {
        super(message)
        this.statusCode = statusCode
        this.code = code
    }

}

enum HttpStatusCode {
    BadRequest = 400,
    Forbidden = 403,
    InternalError = 500
}

enum ErrorCode {
    Internal_Error = 100,
    Bad_Parameter = 200,
    Recapcha_Verified_Failed = 300,
    Recapcha_Low_Score = 301,
    Certificate_Expired = 400,
    Certificate_Verified_Failed = 401,
    Insufficient_Vet = 402,
    Insufficient_Thor = 403,
    Address_RateLimit_Exceeded = 404,
    IP_RateLimit_Exceeded = 405,
    Exist_Transaction = 406,
    Key_Expired = 407,
    Key_Invalid = 408,
    Key_Verified_Failed = 409,

}

export {
    HttpError,
    HttpStatusCode,
    ErrorCode
}