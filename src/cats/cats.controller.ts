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
import { CreateCatDto } from './create-cat.dto';
import { UpdateCatDto } from './update-cat.dto';
import { CatsService, Cat } from './cats.service';

@Controller('cats')
export class CatsController {
  constructor(private readonly catsService: CatsService) {}

  @Post()
  @Header('Cache-Control', 'no-store')
  create(@Body() createCatDto: CreateCatDto): Cat {
    return this.catsService.create(createCatDto);
  }

  @Get()
  findAll(): Cat[] {
    return this.catsService.findAll();
  }

  /**
   * 获取指定ID的猫
   *
   * @param id 猫的ID, 引入 ParseUUIDPipe ：在 @Param('id') 中添加了 NestJS 内置的 ParseUUIDPipe 。这会自动验证传入的 ID 是否符合 UUID 格式，如果不符合，API 将直接返回 400 Bad Request ，无需进入业务逻辑。
   * @returns 猫的详细信息
   */
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string): Cat {
    return this.catsService.findOne(id);
  }

  @Head(':id')
  checkExistence(@Param('id', ParseUUIDPipe) id: string): void {
    if (!this.catsService.exists(id)) {
      throw new NotFoundException(`Cat with ID ${id} not found`);
    }
  }

  @Put(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCatDto: UpdateCatDto,
  ): Cat {
    return this.catsService.update(id, updateCatDto);
  }

  @Patch(':id')
  partialUpdate(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCatDto: UpdateCatDto,
  ): Cat {
    return this.catsService.update(id, updateCatDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string): void {
    return this.catsService.remove(id);
  }
}
