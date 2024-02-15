import { DragStartEvent } from "@dnd-kit/core";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { Bulletin, Section } from "../hooks/useBulletin";
import { Dispatch, SetStateAction } from "react";
import { PublicContribution } from "../hooks/usePublicContributions";
import { QueryClient } from "react-query";

type Param = {
  enableReposAutoAnimate: ReturnType<typeof useAutoAnimate>[1];
  bulletinData: Exclude<Bulletin, null> | undefined;
  setDragActiveItem: Dispatch<SetStateAction<Section | PublicContribution | null>>;
  queryClient: QueryClient;
  user: string | undefined;
};

export const getHandleDragStart =
  ({ enableReposAutoAnimate, bulletinData, setDragActiveItem, queryClient, user }: Param) =>
  (event: DragStartEvent) => {
    enableReposAutoAnimate(false);

    const draggableType = event.active.data.current?.type as "SECTION" | "REPO";

    if (draggableType === "SECTION") {
      const sectionIndex = bulletinData?.sections.findIndex((section) => section.id === event.active.id) as number;
      const section = bulletinData?.sections[sectionIndex];
      setDragActiveItem(section as Section);
      return;
    }

    if (draggableType === "REPO") {
      const contributions = queryClient.getQueryData(["contributions", user?.toLowerCase()]) as PublicContribution[];

      const contributionObjIndex = contributions.findIndex(
        (contribution) => contribution.id === event.active.data.current?.repoID,
      );
      const contribution = contributions[contributionObjIndex];
      setDragActiveItem(contribution);
      return;
    }
  };
