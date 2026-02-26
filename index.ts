import express, { Express, Response } from "express";
import * as database from "./config/database";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";
import cookieParser from "cookie-parser";
import http from "http";
import { Server } from "socket.io";
import { setupSwagger } from "./config/swagger.config";
import compression from "compression";

dotenv.config();

import { routeApiV1 } from "./api/v1/routes/index.route";
import "./config/redis-queue";

const app: Express = express();
const port: number | string = process.env.PORT;
const corsOptions: object = { origin: process.env.CORS_ORIGIN };

app.use(
  compression({
    threshold: 1024,
    filter: (req: Request, res: Response) => {
      if (req.headers["upgrade"] === "websocket") {
        return false;
      }

      const contentType = res.getHeader("Content-Type");
      if (!contentType) return false;

      const type = contentType.toString().toLowerCase();

      if (
        type.startsWith("text/") ||
        type.includes("application/json") ||
        type.includes("application/javascript") ||
        type.includes("text/css")
      ) {
        return compression.filter(req, res);
      }

      return false;
    },
  }),
);

// socketIO
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  },
});
global._io = io;

database.connect();

app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(bodyParser.json());
app.use(cors(corsOptions));

routeApiV1(app);
setupSwagger(app);

server.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
