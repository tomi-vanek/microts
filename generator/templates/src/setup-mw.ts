import * as cors from "cors";
import * as morgan from "morgan";
import * as bodyParser from "body-parser";
import * as multer from "multer";
import { Request, Response, NextFunction, Application } from "express";

import { cfg } from "./config/app-config";

const loggingMW = morgan("short");
const corsMW = cors();
const bodyParserMW = bodyParser.urlencoded({ extended: true });
const jsonParserMW = bodyParser.json({ strict: false, limit: "50mb" });

const healthRedirect = (req: Request, _res: Response, next: NextFunction) => {
    // Health check for cloud deployment
    const healthCheckPath = "/health";
    if (cfg.swaggerSchema.paths[ healthCheckPath ].get && req.path === healthCheckPath) {
        req.url = cfg.swaggerSchema.basePath + healthCheckPath;
        console.log("healthcheck url rewrite", req.path, req.url);
    }
    next();
};

const multerMW = multer({
  limits: { fileSize: 200e6 },
  storage: multer.memoryStorage(),
// TODO: replace "upload" with form field name for file upload, or any for nore files
// }).any();
}).single("upload");

const multerBodyMW = (req: any, res: Response, next: NextFunction): void => {
  let input: ArrayBuffer;
  if (req.files) {
      input = (req.files && req.files[0] && req.files[0].buffer) ?
          req.files[0].buffer as ArrayBuffer : new ArrayBuffer(0);
  } else {
      input = (req.file && req.file.buffer) ?
          req.file.buffer as ArrayBuffer : new ArrayBuffer(0);
  }
  req.body.input = input;
  // TODO: replace "upload" with form field name for file upload
  req.body.upload = `size: ${input.byteLength}`;
  next();
};

const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction): void => {
    if (res.headersSent) {
        console.error("HTTP headers sent - error is forwarded to next handler.");
        return next(err);
    } else if (err.name === "ValidationError" || err.name === "SyntaxError") {
        // validation and syntax errors are responded with status code 400
        res.status(400).json(err);
    } else {
        console.error("Error", err);
        return next(err);
    }
};

const logErrors = (err: Error, _req: Request, _res: Response, next: NextFunction): void => {
    if (err) {
      console.error(err.stack);
    }
    next(err);
};

export const setupMW = (app: Application): void => {
    // entry middleware
    app.use(loggingMW);
    app.use(corsMW);
    app.use(healthRedirect);

    // input validation & formatting middleware
    app.use(bodyParserMW);
    app.use(jsonParserMW);

    app.use(multerMW, multerBodyMW);

    // TODO: add application-specific middleware
};

export const setupErrorHandlingMW = (app: Application): void => {
    app.use(logErrors);
    app.use(errorHandler);
};
