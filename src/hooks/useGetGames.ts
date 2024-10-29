import { useCallback, useState } from "react"
import {OwnedGame} from "../components/GamesView.tsx"
import { invoke } from "@tauri-apps/api/core"

const useGetGames = ()=>{
  const [games,setGames] = useState<OwnedGame[]>([])

  const queryGames = useCallback( async ()=>{
    try{
    const queryResult:OwnedGame[] = await invoke("get_games",{});
    setGames(queryResult);
    }catch (e){
      console.log("Something went wrong when getting games",{e});
    }
  },[]
  );
  return {games,queryGames}
}

export default useGetGames;
