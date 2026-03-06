import { Injectable, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { CreateDogDto } from './create-dog.dto';
import { UpdateDogDto } from './update-dog.dto';
import { BussinessLoggerService } from '@/logger/bussiness-logger.service';

export class Dog {
  id: string;
  name: string;
  age: number;
  breed: string;
}

@Injectable()
export class DogsService {
  constructor(private readonly logger: BussinessLoggerService) {
    this.logger.log('DogsService instance created');
  }

  private readonly dogs: Dog[] = [
    { id: uuidv4(), name: 'Buddy', age: 3, breed: 'Golden Retriever' },
    { id: uuidv4(), name: 'Max', age: 5, breed: 'German Shepherd' },
    { id: uuidv4(), name: 'Bella', age: 2, breed: 'Labrador' },
    { id: uuidv4(), name: 'Charlie', age: 4, breed: 'Beagle' },
    { id: uuidv4(), name: 'Lucy', age: 6, breed: 'Poodle' },
    { id: uuidv4(), name: 'Cooper', age: 1, breed: 'Bulldog' },
    { id: uuidv4(), name: 'Daisy', age: 7, breed: 'Boxer' },
  ];

  create(createDogDto: CreateDogDto): Dog {
    const newDog: Dog = {
      id: uuidv4(),
      ...createDogDto,
    };
    this.dogs.push(newDog);
    return newDog;
  }

  update(id: string, updateDogDto: UpdateDogDto): Dog {
    const index = this.dogs.findIndex((dog) => dog.id === id);
    if (index === -1) {
      throw new NotFoundException(`Dog with ID ${id} not found`);
    }
    const updatedDog = { ...this.dogs[index], ...updateDogDto };
    this.dogs[index] = updatedDog;
    return updatedDog;
  }

  findAll(): Dog[] {
    return this.dogs;
  }

  exists(id: string): boolean {
    return this.dogs.some((dog) => dog.id === id);
  }

  findOne(id: string): Dog {
    const dog = this.dogs.find((dog) => dog.id === id);
    if (!dog) {
      throw new NotFoundException(`Dog with ID ${id} not found`);
    }
    return dog;
  }

  remove(id: string): void {
    const index = this.dogs.findIndex((dog) => dog.id === id);
    if (index === -1) {
      throw new NotFoundException(`Dog with ID ${id} not found`);
    }
    this.dogs.splice(index, 1);
  }
}
