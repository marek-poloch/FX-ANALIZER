import { Module } from "@nestjs/common";
import { CotController } from "./cot.controller";

@Module({ controllers: [CotController] })
export class CotModule {}
