import {
  ChangeEventHandler,
  useEffect,
  useState,
} from "react";
import "./App.css";

import {
  Box,
  Button,
  CssBaseline,
  CssVarsProvider,
  Typography,
} from "@mui/joy";
import useBggQuery from "./hooks/useBggQuery";
import { invoke } from "@tauri-apps/api/core";
import useGetPlayers from "./hooks/useGetPlayers";
import Sidebar from "./components/sidebar";
import { AddGameModal, GamesList } from "./components/GamesView";
import { PlayersView } from "./components/Players";

export type ViewMode = "GAMES" | "PLAYERS" | "PLAYS";

function App() {
  const [currentViewState, setViewState] = useState<ViewMode>("GAMES");

  return (
    <CssVarsProvider>
      <CssBaseline />
      <Box minHeight="100dvh" display="flex">
        <Sidebar
          currentViewState={currentViewState}
          setViewState={setViewState}
        />
        <Box
          component="main"
          className="MainContent"
          display="flex"
          flexDirection="column"
          height="100dvh"
          gap={1}
          flex={1}
        >
          <MainDisplay viewState={currentViewState} />
        </Box>
      </Box>
    </CssVarsProvider>
  );
}


const MainDisplay = ({ viewState }: { viewState: ViewMode }) => {
  const [addGameVisible, setAddGameVisible] = useState(false);
  const innerContent = (viewState: ViewMode) => {
    switch (viewState) {
      case "GAMES": {
        return (
          <Box flex={1} height="100dvh" display="flex" flexDirection="column">
            <AddGameModal
              open={addGameVisible}
              closeModal={() => {
                setAddGameVisible(false);
              }}
            />
            <Box p={2}>
              <Button onClick={() => setAddGameVisible(true)}>Add Game</Button>
            </Box>
          <GamesList />
          </Box>
        );
      }
      case "PLAYS": {
        return <Typography> Plays View </Typography>;
      }
      case "PLAYERS": {
        return <PlayersView />
      }
      default: {
        return <Typography>INVALID VIEW</Typography>;
      }
    }
  };
  return (
    <Box flex={1} display="flex" flexDirection="column">
      {innerContent(viewState)}
    </Box>
  );
};

export default App;
