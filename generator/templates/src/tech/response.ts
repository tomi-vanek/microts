export interface ErrorMsg {
    status: number;
    type: string;
    message: string;
    timestamp: string;
}

export const now = () => JSON.parse(JSON.stringify(new Date()));

const errorObject = (status: number, type: string, message: string): ErrorMsg => {
    return {status, type, message, timestamp: now()};
};

export const validationError = (msg: string) => errorObject(400, "Bad request", msg);
export const forbiddenError = (user: string, x: string) => errorObject(403, "Forbidden",
    `The user ${user} does not have the necessary permissions for required action on resource ${x}.`);
export const notFoundError = (x: string) => errorObject(404, "Not found", `Resource ${x} not found.`);
export const serverError = (msg: string) => errorObject(500, "Internal Server Error", msg);
