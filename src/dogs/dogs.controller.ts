import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Head,
  Body,
  Param,
  Header,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  NotFoundException,
} from '@nestjs/common';
import { CreateDogDto } from './create-dog.dto';
import { UpdateDogDto } from './update-dog.dto';
import { DogsService, Dog } from './dogs.service';

@Controller('dogs')
export class DogsController {
  constructor(private readonly dogsService: DogsService) {}

  @Post()
  @Header('Cache-Control', 'no-store')
  create(@Body() createDogDto: CreateDogDto): Dog {
    return this.dogsService.create(createDogDto);
  }

  @Get()
  findAll(): Dog[] {
    return this.dogsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string): Dog {
    return this.dogsService.findOne(id);
  }

  @Head(':id')
  checkExistence(@Param('id', ParseUUIDPipe) id: string): void {
    if (!this.dogsService.exists(id)) {
      throw new NotFoundException(`Dog with ID ${id} not found`);
    }
  }

  @Put(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDogDto: UpdateDogDto,
  ): Dog {
    return this.dogsService.update(id, updateDogDto);
  }

  @Patch(':id')
  partialUpdate(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDogDto: UpdateDogDto,
  ): Dog {
    return this.dogsService.update(id, updateDogDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string): void {
    return this.dogsService.remove(id);
  }
}
