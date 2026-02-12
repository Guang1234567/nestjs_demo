import { Injectable, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { CreateCatDto } from './create-cat.dto';
import { UpdateCatDto } from './update-cat.dto';

export class Cat {
  id: string;
  name: string;
  age: number;
  breed: string;
}

@Injectable()
export class CatsService {
  private readonly cats: Cat[] = [];

  create(createCatDto: CreateCatDto): Cat {
    const newCat: Cat = {
      id: uuidv4(),
      ...createCatDto,
    };
    this.cats.push(newCat);
    return newCat;
  }

  findAll(): Cat[] {
    return this.cats;
  }

  exists(id: string): boolean {
    return this.cats.some((cat) => cat.id === id);
  }

  findOne(id: string): Cat {
    const cat = this.cats.find((cat) => cat.id === id);
    if (!cat) {
      throw new NotFoundException(`Cat with ID ${id} not found`);
    }
    return cat;
  }

  update(id: string, updateCatDto: UpdateCatDto): Cat {
    const index = this.cats.findIndex((cat) => cat.id === id);
    if (index === -1) {
      throw new NotFoundException(`Cat with ID ${id} not found`);
    }
    const updatedCat = { ...this.cats[index], ...updateCatDto };
    this.cats[index] = updatedCat;
    return updatedCat;
  }

  remove(id: string): void {
    const index = this.cats.findIndex((cat) => cat.id === id);
    if (index === -1) {
      throw new NotFoundException(`Cat with ID ${id} not found`);
    }
    this.cats.splice(index, 1);
  }
}
