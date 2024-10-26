import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";
import { Box, Button, CssBaseline, CssVarsProvider, DialogContent, DialogTitle, Input, List, ListItem, ListItemButton, ListItemContent, Modal, ModalClose, ModalDialog, Sheet, Typography } from "@mui/joy";
import {Casino, EmojiEvents, PeopleAlt} from "@mui/icons-material"
import useBggQuery from "./hooks/useBggQuery";


const sidebarWidth = 200;

type ViewMode = "GAMES" | "PLAYERS" | "PLAYS";


function App() {
  const [currentViewState,setViewState] = useState<ViewMode>("GAMES")
  

  return (
    <CssVarsProvider>
    <CssBaseline />
    <Box minHeight="100dvh" display="flex" >
      <Sidebar currentViewState={currentViewState} setViewState={setViewState}/>
    <Box component="main" className="MainContent" display="flex" flexDirection="column" height="100dvh" gap={1} flex={1}>
      <MainDisplay viewState={currentViewState}/>
    </Box>
    </Box>
    </CssVarsProvider>
  );
}

function Sidebar({setViewState,currentViewState}:{setViewState:React.Dispatch<React.SetStateAction<ViewMode>>,currentViewState:ViewMode}){
  return(
    <Sheet
    sx={{
      position: "sticky",
      top: 0,
      p: 2,
      height: "100dvh",
        width: sidebarWidth,
      borderRight: "1px solid"
    }}
    >
    <List>
      <ListItem>
    <ListItemButton selected={currentViewState === "GAMES"} onClick={()=>{setViewState("GAMES")}}>
    <Casino />
        <ListItemContent>
          <Typography level="title-sm">Games</Typography>
        </ListItemContent>
</ListItemButton>
        </ListItem>

      <ListItem>
    <ListItemButton selected={currentViewState === "PLAYERS"} onClick={()=>{setViewState("PLAYERS")}}>
    <PeopleAlt />
        <ListItemContent>
          <Typography level="title-sm">Players</Typography>
        </ListItemContent>
</ListItemButton>
        </ListItem>

      <ListItem>
    <ListItemButton selected={currentViewState === "PLAYS"}onClick={()=>{setViewState("PLAYS")}}>
    <EmojiEvents />
        <ListItemContent>
          <Typography level="title-sm">Plays</Typography>
        </ListItemContent>
</ListItemButton>
        </ListItem>
      </List>
    </Sheet>
  )
}

const MainDisplay = ({viewState}:{viewState:ViewMode})=>{
  const [addGameVisible,setAddGameVisible] = useState(false);
  const [gameName,setGameName] = useState("");
  const {games,query} = useBggQuery();
  const innerContent = (state:ViewMode) =>{
  switch (viewState){
    case("GAMES"): {
      return <Box flex={1} height="100dvh" display="flex" flexDirection="column">
        <Box p={2}><Button onClick={()=>setAddGameVisible(true)}>Add Game</Button></Box>
        <Modal open={addGameVisible} onClose={()=>setAddGameVisible(false)}>
          <ModalDialog layout="fullscreen">
            <ModalClose />
        <DialogTitle>Add New Game</DialogTitle>
        <DialogContent sx={{display:"flex", flexDirection:"column"}}>
        <Box display="flex" flexDirection="column" width="100%" gap={2} flex={1}>
        <Box p={1} maxWidth={400} border="2px solid">
        <Input placeholder="Name of Game" value={gameName} onChange={(e)=>{setGameName(e.target.value)}} />
        <Button onClick={async()=>{
          let name = await query(gameName);
          console.log(name);
        }}>Search</Button>
        </Box>
        <Box p={1} flex={1} border="2px solid">search results from bgg</Box>
        </Box>
        </DialogContent>
            </ModalDialog>
        </Modal>
        </Box>
}
case("PLAYS"):{
  return <Typography> Plays View </Typography>
}
case("PLAYERS"):{
  return <Typography>Players View </Typography>
}
    default: {return <Typography>INVALID VIEW</Typography>}
  }
  }
  return <Box flex={1} display="flex" flexDirection="column">{innerContent(viewState)}</Box>
}

export default App;
