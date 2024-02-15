import { DragOverEvent, DragStartEvent } from "@dnd-kit/core";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { Bulletin, Section } from "../hooks/useBulletin";
import { Dispatch, SetStateAction } from "react";
import { PublicContribution } from "../hooks/usePublicContributions";
import { QueryClient } from "react-query";
import { arraySwap } from "@dnd-kit/sortable";

type BulletinClientData = Exclude<Bulletin, null> | undefined;

type Param = {
  enableReposAutoAnimate: ReturnType<typeof useAutoAnimate>[1];
  bulletinClientData: BulletinClientData;
  setBulletinClientData: Dispatch<SetStateAction<BulletinClientData>>;
  setDragActiveItem: Dispatch<SetStateAction<Section | PublicContribution | null>>;
  queryClient: QueryClient;
  user: string | undefined;
};

export const getDragHandlers = ({
  enableReposAutoAnimate,
  bulletinClientData,
  setBulletinClientData,
  setDragActiveItem,
  queryClient,
  user,
}: Param) => {
  const handleDragStart = getHandleDragStart({
    setDragActiveItem,
    bulletinClientData,
    enableReposAutoAnimate,
    queryClient,
    user,
  });

  const handleDragOver = getHandleDragOver(setBulletinClientData);

  const handleDragEnd = () => {
    enableReposAutoAnimate(true);
    setDragActiveItem(null);
  };

  return { handleDragStart, handleDragOver, handleDragEnd };
};

type DragStartParam = Omit<Param, "setBulletinClientData">;

const getHandleDragStart =
  ({ enableReposAutoAnimate, bulletinClientData, setDragActiveItem, queryClient, user }: DragStartParam) =>
  (event: DragStartEvent) => {
    enableReposAutoAnimate(false);

    const draggableType = event.active.data.current?.type as "SECTION" | "REPO";

    if (draggableType === "SECTION") {
      const sectionIndex = bulletinClientData?.sections.findIndex(
        (section) => section.id === event.active.id,
      ) as number;
      const section = bulletinClientData?.sections[sectionIndex];
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

const getHandleDragOver =
  (setBulletinClientData: Dispatch<SetStateAction<BulletinClientData>>) => (event: DragOverEvent) => {
    const { active, over } = event;
    const activeDraggableType = active.data.current?.type as "SECTION" | "REPO";
    const overDraggableType = over?.data.current?.type as "SECTION" | "REPO";

    if (over === null || activeDraggableType !== overDraggableType) {
      return;
    }

    if (activeDraggableType === "REPO" && active.data.current?.sectionID !== over.data.current?.sectionID) {
      return;
    }

    const isSectionOnSection = activeDraggableType === "SECTION";
    if (isSectionOnSection) {
      setBulletinClientData((prev) => {
        if (prev === undefined) {
          return prev;
        }
        const activeSectionIndex = prev.sections.findIndex((section) => section.id === active.id);
        const overIndex = prev.sections.findIndex((section) => section.id === over.id);
        prev.sections = arraySwap(prev.sections, activeSectionIndex, overIndex);
      });
      return;
    }

    const isRepoOnRepo = activeDraggableType === "REPO";
    if (isRepoOnRepo) {
      setBulletinClientData((prev) => {
        if (prev === undefined) {
          return prev;
        }
        const dragOverSectionIndex = prev.sections.findIndex(
          (section) => section.id === active.data.current?.sectionID,
        );
        const dragOverSection = prev.sections[dragOverSectionIndex];
        const activeItemIndex = dragOverSection.repos.findIndex((repo) => repo.id === active.id);
        const overItemIndex = dragOverSection.repos.findIndex((repo) => repo.id === over.id);

        dragOverSection.repos = arraySwap(dragOverSection.repos, activeItemIndex, overItemIndex);
      });
      return;
    }
  };
