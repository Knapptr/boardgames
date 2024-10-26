import { invoke } from "@tauri-apps/api/core";
import { useState } from "react"

export type GameType = "Game" | "Expansion";
interface GameQueryResponse{
  name: string,
    published: number,
    bgg_id: string,
    game_type: GameType
}
const useBggQuery = () =>{
  const [games,setGames] = useState<GameQueryResponse[]>([]);
  const query = async(query:String)=>{ const response:GameQueryResponse[] = await invoke("bgg_games_query",{query}); setGames(response); return response}
  const clearGames = () => {setGames([])}
  return {games,query,clearGames}

}

export default useBggQuery;
