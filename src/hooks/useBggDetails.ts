import { useState } from "react";
import { GameType } from "./useBggQuery";
import { invoke } from "@tauri-apps/api/core";

interface Game{
    game_type: GameType,
    name: String,
    published: number | undefined
    bgg_id: string | undefined
    min_players: number,
    max_players: number,
    player_poll: string,
    mechanics: string[],
    categories: string[],
    artists: string[],
    designers: string[],
    description: string,
    image_url: string
}
const useBggDetails = ()=>{
  const [game,setGame] = useState<Game | null>(null)
const getGameById = async (id:string)=>{
  const result: Game = await invoke("bgg_game_from_id", {id});
  setGame(result);
}
return {game,getGameById}
}

export default useBggDetails;
