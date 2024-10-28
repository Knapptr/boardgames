import {
  ChangeEventHandler,
  ReactEventHandler,
  useEffect,
  useState,
} from "react";
import "./App.css";
import {
  AspectRatio,
  Box,
  Button,
  Chip,
  CssBaseline,
  CssVarsProvider,
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
  Stack,
  Typography,
} from "@mui/joy";
import { Casino, EmojiEvents, PeopleAlt } from "@mui/icons-material";
import useBggQuery from "./hooks/useBggQuery";
import useBggDetails from "./hooks/useBggDetails";
import { invoke } from "@tauri-apps/api/core";
import useGetPlayers from "./hooks/useGetPlayers";

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
      <Box flex={0.7} overflow="scroll">
        <Box
          display="flex"
          position="sticky"
          top={0}
          zIndex={100}
          bgcolor="linen"
          py={3}
          alignItems="center"
        >
          <Box px={3}>
            <Typography component="h2">
              {game.name} {game.published}
            </Typography>
            <Typography level="body-xs">Bgg id: {game.bgg_id}</Typography>
          </Box>
          <Box flex={1}>
            <Button>Add Game</Button>
          </Box>
        </Box>
        <Box overflow="scroll"></Box>
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
          {selectedBggId && <SelectedGameDetails bggId={selectedBggId} />}
        </Box>
      </ModalDialog>
    </Modal>
  );
};

const AddPlayerModal = ({
  open,
  closeModal,
}: {
  open: boolean;
  closeModal: () => void;
}) => {
  const [name, setName] = useState("");

  const clearName = () => {
    setName("");
  };
  const handleNameChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    setName(e.target.value);
  };
  const handleClose = () => {
    clearName();
    closeModal();
  };

  const handleAddPlayer = async () => {
    try {
      const player_id: number = await invoke("create_player", { name });
      console.log("Player added succesfully");
      handleClose();
    } catch (e) {
      console.log("Error adding player: ", { e });
    }
  };
  return (
    <Modal open={open} onClose={handleClose}>
      <ModalDialog>
        <ModalClose />
        <DialogTitle>Add Player</DialogTitle>
        <Input
          placeholder="Player Name"
          value={name}
          onChange={handleNameChange}
        />
        <Button disabled={name.length === 0} onClick={handleAddPlayer}>
          Add
        </Button>
      </ModalDialog>
    </Modal>
  );
};
const PlayerList = ()=>{
  const {players,getPlayers} = useGetPlayers();
  useEffect(()=>{getPlayers()},[getPlayers]);
  return <List>
    {players.map(p=><ListItem><ListItemContent>{p.name}</ListItemContent></ListItem>)}
    </List>
}
const MainDisplay = ({ viewState }: { viewState: ViewMode }) => {
  const [addGameVisible, setAddGameVisible] = useState(false);
  const [addPlayerVisible, setAddPlayerVisible] = useState(false);
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
          </Box>
        );
      }
      case "PLAYS": {
        return <Typography> Plays View </Typography>;
      }
      case "PLAYERS": {
        return (
          <Box flex={1} height="100dvh" display="flex" flexDirection="column">
            <AddPlayerModal
              open={addPlayerVisible}
              closeModal={() => setAddPlayerVisible(false)}
            />
            <Box p={2}>
              <Button onClick={() => setAddPlayerVisible(true)}>
                Add Player
              </Button>
            </Box>
          <PlayerList />
          </Box>
        );
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
