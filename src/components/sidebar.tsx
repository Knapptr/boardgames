import {
  List,
  ListItem,
  ListItemButton,
  ListItemContent,
  Sheet,
  Typography,
} from "@mui/joy";
import { Casino, EmojiEvents, PeopleAlt } from "@mui/icons-material";
import {ViewMode} from "../App";

const sidebarWidth = 200;

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

export default Sidebar
