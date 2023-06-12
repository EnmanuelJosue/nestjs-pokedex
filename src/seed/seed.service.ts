import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { PokeResponse } from './interfaces/poker-response.interface';
import { PokemonService } from 'src/pokemon/pokemon.service';
import { CreatePokemonDto } from 'src/pokemon/dto/create-pokemon.dto';
import { AxiosAdapter } from 'src/common/adapters/axios.adapter';

@Injectable()
export class SeedService {

  

  constructor(
    private readonly http: AxiosAdapter,
    private pokemonService: PokemonService
    ){}

  async executeSeed(){
    this.pokemonService.removeAll();

    const data = await this.http.get<PokeResponse>(`https://pokeapi.co/api/v2/pokemon?limit=650`);

    const pokemonToInsert: CreatePokemonDto[] = [];

    data.results.forEach(( {name, url} ) => {
      const segments = url.split('/');
      const no:number = +segments[ segments.length - 2 ];

      const pokemon: CreatePokemonDto = {
        name,
        no
      }
      pokemonToInsert.push(pokemon);
    })
    this.pokemonService.insertMany(pokemonToInsert);
    return data.results;
  }
}
