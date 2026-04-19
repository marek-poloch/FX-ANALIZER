import { Module } from "@nestjs/common";
import { MacroController } from "./macro.controller";

@Module({ controllers: [MacroController] })
export class MacroModule {}
