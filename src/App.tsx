import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";
import {
  AspectRatio,
  Box,
  Button,
  Chip,
  CssBaseline,
  CssVarsProvider,
  DialogContent,
  DialogTitle,
  Input,
  List,
  ListItem,
  ListItemButton,
  ListItemContent,
  Modal,
  ModalClose,
  ModalDialog,
  Sheet,
  Typography,
} from "@mui/joy";
import { Casino, EmojiEvents, PeopleAlt } from "@mui/icons-material";
import useBggQuery from "./hooks/useBggQuery";
import useBggDetails from "./hooks/useBggDetails";

const sidebarWidth = 200;

type ViewMode = "GAMES" | "PLAYERS" | "PLAYS";

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

function Sidebar({
  setViewState,
  currentViewState,
}: {
  setViewState: React.Dispatch<React.SetStateAction<ViewMode>>;
  currentViewState: ViewMode;
}) {
  return (
    <Sheet
      sx={{
        position: "sticky",
        top: 0,
        p: 2,
        height: "100dvh",
        width: sidebarWidth,
        borderRight: "1px solid",
      }}
    >
      <List>
        <ListItem>
          <ListItemButton
            selected={currentViewState === "GAMES"}
            onClick={() => {
              setViewState("GAMES");
            }}
          >
            <Casino />
            <ListItemContent>
              <Typography level="title-sm">Games</Typography>
            </ListItemContent>
          </ListItemButton>
        </ListItem>

        <ListItem>
          <ListItemButton
            selected={currentViewState === "PLAYERS"}
            onClick={() => {
              setViewState("PLAYERS");
            }}
          >
            <PeopleAlt />
            <ListItemContent>
              <Typography level="title-sm">Players</Typography>
            </ListItemContent>
          </ListItemButton>
        </ListItem>

        <ListItem>
          <ListItemButton
            selected={currentViewState === "PLAYS"}
            onClick={() => {
              setViewState("PLAYS");
            }}
          >
            <EmojiEvents />
            <ListItemContent>
              <Typography level="title-sm">Plays</Typography>
            </ListItemContent>
          </ListItemButton>
        </ListItem>
      </List>
    </Sheet>
  );
}

const SelectedGameDetails = ({ bggId }: { bggId: string }) => {
  const { game, getGameById } = useBggDetails();
  useEffect(() => {
    getGameById(bggId);
  }, [bggId]);
  return (
    game && (
      <Box overflow="scroll">
        <Typography component="h2">
          {game.name} {game.published}
        </Typography>
        {game.image_url && (
          <Box display="inline">
            <AspectRatio minHeight={100} maxHeight={400} objectFit="contain">
              <img src={game.image_url} loading="lazy" />
            </AspectRatio>
          </Box>
        )}
        {game.designers.map((designer) => (
          <Typography>{designer}</Typography>
        ))}
        <Box>
          {game.mechanics.map((mechanic) => (
            <Chip>{mechanic}</Chip>
          ))}
        </Box>
        <Box>
          {game.categories.map((category) => (
            <Chip>{category}</Chip>
          ))}
        </Box>
        <Typography component="p">
          {game.min_players} - {game.max_players} players
        </Typography>
        <Typography component="p">{game.player_poll}</Typography>
        <Typography component="p">{game.description}</Typography>
      </Box>
    )
  );
};
const AddGameModal = ({
  open,
  closeModal,
}: {
  open: boolean;
  closeModal: () => void;
}) => {
  const [gameName, setGameName] = useState("");
  const { games, query, clearGames } = useBggQuery();
  const [selectedBggId, setSelectedBggId] = useState<string | null>(null);
  const selectGame = (id: string) => {
    setSelectedBggId(id);
  };
  const clearFields = () => {
    clearGames();
    setGameName("");
    setSelectedBggId(null);
  };
  return (
    <Modal
      open={open}
      onClose={() => {
        closeModal();
        clearFields();
      }}
    >
      <ModalDialog layout="fullscreen">
        <ModalClose />
        <DialogTitle>Add New Game</DialogTitle>
        <Box p={1} maxWidth={400} border="2px solid">
          <Input
            placeholder="Name of Game"
            value={gameName}
            onChange={(e) => {
              setGameName(e.target.value);
            }}
          />
          <Button
            onClick={async () => {
              query(gameName);
            }}
          >
            Search
          </Button>
        </Box>
        <Box flex={1} display="flex" gap={2} overflow="auto">
          <Box p={1} flex={0.3} border="2px solid" overflow="scroll">
            <List sx={{ overflow: "scroll" }}>
              {games.map((g) => (
                <ListItem key={`game-${g.bgg_id}`}>
                  <ListItemButton
                    selected={g.bgg_id === selectedBggId}
                    onClick={() => {
                      selectGame(g.bgg_id);
                    }}
                  >
                    <ListItemContent>
                      {g.name} - {g.published} - {g.game_type}
                    </ListItemContent>
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Box>
          <Box flex={0.7} overflow="scroll" border="2px solid">
            {selectedBggId && <SelectedGameDetails bggId={selectedBggId} />}
          </Box>
        </Box>
      </ModalDialog>
    </Modal>
  );
};
const MainDisplay = ({ viewState }: { viewState: ViewMode }) => {
  const [addGameVisible, setAddGameVisible] = useState(false);
  const innerContent = (state: ViewMode) => {
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
          </Box>
        );
      }
      case "PLAYS": {
        return <Typography> Plays View </Typography>;
      }
      case "PLAYERS": {
        return <Typography>Players View </Typography>;
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
