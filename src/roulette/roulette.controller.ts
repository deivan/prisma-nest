import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { RouletteService } from './roulette.service';
import { CreateRouletteDto } from './dto/create-roulette.dto';
import { UpdateRouletteDto } from './dto/update-roulette.dto';


@Controller('roulette')
export class RouletteController {
  constructor(private readonly rouletteService: RouletteService) {}

  @Post()
  create() {
    return this.rouletteService.create();
  }

  @Get()
  findAll() {
    return this.rouletteService.findAll();
  }

  @Get('spin/:clientSeed')
  spin(@Param('clientSeed') clientSeed: string) {
    return this.rouletteService.spinOne(clientSeed);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRouletteDto: UpdateRouletteDto) {
    return this.rouletteService.update(+id, updateRouletteDto);
  }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.rouletteService.remove(+id);
  // }
}
