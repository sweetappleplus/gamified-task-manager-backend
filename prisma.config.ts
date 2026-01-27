import "dotenv/config";
import { HttpException, HttpStatus } from "@nestjs/common";
import { defineConfig } from "prisma/config";
import { DATABASE_URL } from "./src/shared/consts/index.js";

if (!DATABASE_URL) {
  throw new HttpException('DATABASE_URL is not set in the environment variables', HttpStatus.INTERNAL_SERVER_ERROR);
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: DATABASE_URL,
  },
});
