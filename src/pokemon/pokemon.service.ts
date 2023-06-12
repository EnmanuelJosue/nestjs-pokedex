import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { Model, isValidObjectId } from 'mongoose';
import { Pokemon } from './entities/pokemon.entity';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class PokemonService {

  constructor(
    @InjectModel( Pokemon.name )
    private readonly pokemonModel: Model<Pokemon>
  ){}

  async create(createPokemonDto: CreatePokemonDto) {
    createPokemonDto.name = createPokemonDto.name.toLocaleLowerCase();
    try {
      return await this.pokemonModel.create(createPokemonDto);
    } catch (error) {
      this.handleExceptions(error);
    }
  }

  async findAll() {
    return await this.pokemonModel.find();
  }

  async findOne(term: string) {
    
    let pokemon: Pokemon;
    if ( !isNaN(+term) ) {
      pokemon = await this.pokemonModel.findOne( {no: term} );
    }

    // mongoID
    if ( !pokemon && isValidObjectId(term) ) {
      pokemon = await this.pokemonModel.findOne( {_id: term} );
    }

    // name
    if ( !pokemon ) {
      pokemon = await this.pokemonModel.findOne( {name: term.toLowerCase().trim() })
    }

    if (!pokemon) {
      throw new NotFoundException(`Pokemon with term ${term} not found`)
    }
    return pokemon
 
  }

  async update(term: string, updatePokemonDto: UpdatePokemonDto) {
    const pokemon = await this.findOne(term);

    if (updatePokemonDto.name) {
      updatePokemonDto.name = updatePokemonDto.name.toLowerCase();
    }
    try {
      await pokemon.updateOne(updatePokemonDto);
    } catch (error) {
      this.handleExceptions(error);
    }
    return { ...pokemon.toJSON(), ...updatePokemonDto } ;
  }

  async remove(id: string) {
    // const pokemon = await this.findOne(id);

    // await pokemon.deleteOne();

    // return { message: "delete success"};
    // const result = await this.pokemonModel.findByIdAndDelete(id);
    const { deletedCount } = await this.pokemonModel.deleteOne({ _id: id });
    if (deletedCount === 0) {
      throw new BadRequestException(`Pokemon with id ${id} not found`);
    }
    return ;
  }

  private handleExceptions( error: any){
    if (error.code === 11000) {
      throw new BadRequestException(`Pokemon exists in db ${ JSON.stringify(error.keyValue) }`);
    }
    throw new InternalServerErrorException(`Can't create Pokemon - Check server logs`);
  }
}