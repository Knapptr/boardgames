import { invoke } from "@tauri-apps/api/core";
import { useState } from "react"

const useBggQuery = () =>{
  const games = useState([]);
  const query = async(query:String)=>{ const response = await invoke("bgg_games_query",{query}); return response;}
  return {games,query}

}

export default useBggQuery;
