import {
  Box,
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Input,
  List,
  ListItem,
  ListItemContent,
  Modal,
  ModalClose,
  ModalDialog,
  Stack,
  Typography,
} from "@mui/joy";
import { invoke } from "@tauri-apps/api/core";
import { ChangeEventHandler, useEffect, useState } from "react";
import useGetPlayers from "../hooks/useGetPlayers";
import { DeleteForever } from "@mui/icons-material";

interface Player {
  name: string;
  id: number;
}

const AddPlayerModal = ({
  open,
  closeModal,
  refreshPlayers,
}: {
  open: boolean;
  closeModal: () => void;
  refreshPlayers: () => void;
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
      refreshPlayers();
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

const DeletePlayerModal = ({
  open,
  onClose,
  refreshPlayers,
}: {
  open: Player | null;
  onClose: () => void;
  refreshPlayers: () => void;
}) => {
  const handleDelete = async (player: Player) => {
    try {
      await invoke("delete_player", { id: player.id });
      refreshPlayers();
      onClose();
    } catch (e) {
      console.log("Something went wrong deleting player", { e });
    }
  };
  const isOpen = () => {
    return open !== null;
  };
  return (
    open !== null && (
      <Modal open={isOpen()} onClose={onClose}>
        <ModalDialog>
          <DialogTitle>Delete Player</DialogTitle>
          <DialogContent>
            Are you sure you want to delete player: {open.name}?
          </DialogContent>
          <DialogActions>
            <Stack direction="row">
              <Button
                onClick={() => {
                  handleDelete(open);
                }}
              >
                Delete
              </Button>
              <Button onClick={onClose}>Nevermind</Button>
            </Stack>
          </DialogActions>
        </ModalDialog>
      </Modal>
    )
  );
};

const listItemWidth = 300;
const listMaxWidth = 600;
const PlayerList = ({
  players,
  handleDelete,
}: {
  players: Player[];
  handleDelete: (player: Player) => void;
}) => {
  return (
    <List sx={{ maxWidth: listMaxWidth }}>
      {players.map((p) => (
        <ListItem>
          <ListItemContent>
            <Box display="flex" alignItems="center">
              <Typography minWidth={listItemWidth}>{p.name}</Typography>{" "}
              <IconButton
                onClick={() => {
                  handleDelete(p);
                }}
              >
                <DeleteForever />
              </IconButton>
            </Box>
          </ListItemContent>
        </ListItem>
      ))}
    </List>
  );
};
export const PlayersView = () => {
  const [addPlayerVisible, setAddPlayerVisible] = useState(false);
  const { players, getPlayers } = useGetPlayers();
  const [deletePlayerVisible, setDeletePlayerVisible] = useState<Player | null>(
    null
  );

  const handleCloseDeletePlayer = () => {
    setDeletePlayerVisible(null);
  };
  const handleOpenDeletePlayer = (player: Player) => {
    setDeletePlayerVisible(player);
  };
  useEffect(() => {
    getPlayers();
  }, [getPlayers]);

  return (
    <Box flex={1} height="100dvh" display="flex" flexDirection="column">
      <AddPlayerModal
        open={addPlayerVisible}
        refreshPlayers={getPlayers}
        closeModal={() => setAddPlayerVisible(false)}
      />
      <DeletePlayerModal
        open={deletePlayerVisible}
        onClose={handleCloseDeletePlayer}
        refreshPlayers={getPlayers}
      />
      <Box p={2}>
        <Button onClick={() => setAddPlayerVisible(true)}>Add Player</Button>
      </Box>
      <PlayerList players={players} handleDelete={handleOpenDeletePlayer} />
    </Box>
  );
};
