import { invoke } from "@tauri-apps/api/core";
import { useCallback, useEffect, useState } from "react"

  interface Player {
    name: string,
      id: number
  }
const useGetPlayers = () =>{
const [players,setPlayers] = useState<Player[]>([]);

const getPlayers = useCallback(async()=>{
  let results:Player[] = await invoke("get_players");
setPlayers(results);
},[])

return {getPlayers,players}
}

export default useGetPlayers;
