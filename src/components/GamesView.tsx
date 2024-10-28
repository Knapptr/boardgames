import {
  AspectRatio,
  Box,
  Button,
  Chip,
  DialogTitle,
  Input,
  List,
  ListItem,
  ListItemButton,
  ListItemContent,
  Modal,
  ModalClose,
  ModalDialog,
  Typography,
} from "@mui/joy";
import useBggDetails from "../hooks/useBggDetails";
import useBggQuery from "../hooks/useBggQuery";
import { useEffect,useState } from "react";

export const SelectedGameDetails = ({ bggId }: { bggId: string }) => {
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
export const AddGameModal = ({
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

