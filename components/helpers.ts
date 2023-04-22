import { nanoid } from "nanoid";
import { Bulletin } from "../hooks/useBulletin";

export const newBulletin = (): Exclude<Bulletin, null> => ({
  sections: [newSection()],
});

export const newSection = () => ({
  id: nanoid(),
  name: "New Section",
  repos: [],
});
