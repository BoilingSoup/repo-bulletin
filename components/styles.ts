import { CSSObject, MantineTheme } from "@mantine/core";

type PxSize = `${number}px`;

export const NAVBAR_HEIGHT: PxSize = "60px";

export const homeCenterSx = (theme: MantineTheme): CSSObject => ({
  width: "100vw",
  height: "100vh",
  background: theme.colors.github[9],
  position: "relative",
});

export const homeCarouselTextSx = (theme: MantineTheme): CSSObject => ({
  fontSize: "clamp(3rem, 10vw, 4rem)",
  textAlign: "center",
  color: theme.colors.dark[1],
});

export const homeSkeletonSx = ({ colors }: MantineTheme): CSSObject => ({
  ":before": {
    background: colors.dark[5],
  },
  ":after": {
    background: colors.dark[7],
  },
  margin: "60px auto",
  width: "300px",
  height: "60px",
});

export const homeViewPageBtnSx = (): CSSObject => ({
  height: "60px",
  width: "300px",
  margin: "60px auto",
});

export const homeLoginBtnSx = (): CSSObject => ({
  height: "60px",
  width: "clamp(220px, 10vw, 300px)",
  fontSize: "clamp(0.5rem, 10vw, 1rem)",
  margin: "60px auto",
});

export const homeLoaderContainerSx = (): CSSObject => ({ height: "60px", width: "300px", margin: "60px auto" });

export const footerFlexSx = (): CSSObject => ({
  fontSize: "clamp(0.5rem, 10vw, 1.2rem)",
  textAlign: "center",
});

export const footerIconBtnSx = (theme: MantineTheme): CSSObject => ({
  color: theme.colors.dark[3],
  ":hover": {
    background: "none",
  },
});

export const settingsLoadingContainerSx = (): CSSObject => ({
  height: "100vh",
  width: "100vw",
  position: "absolute",
  top: 0,
  left: 0,
  background: "rgba(0, 0, 0, 0.5)",
  zIndex: 9999,
});

export const deleteAccountTextSx = (): CSSObject => ({ color: "white", fontSize: "3rem", textAlign: "center" });

export const settingsBtnSx = (): CSSObject => ({
  fontSize: "2rem",
  width: "200px",
  height: "60px",
  margin: "auto",
});

export const deleteDenyBtnSx = (theme: MantineTheme): CSSObject => ({
  ...settingsBtnSx(),
  backgroundColor: theme.colors.red[5],
  ":hover": {
    backgroundColor: theme.colors.red[6],
  },
});

export const pageContainerSx = (theme: MantineTheme): CSSObject => ({
  width: "100vw",
  height: "100vh",
  background: theme.colors.github[9],
  overflowX: "hidden",
});

export const pageLoaderContainerSx = (): CSSObject => ({
  zIndex: 999999,
  bg: "rgba(0, 0, 0, 0.55)",
  position: "absolute",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
});

export const userImageSx = (): CSSObject => ({
  height: "200px",
  width: "200px",
  margin: "0 auto",
  borderRadius: 9999,
});

export const emptyTextSx = (theme: MantineTheme): CSSObject => ({
  color: theme.colors.dark[1],
  fontSize: "clamp(2rem, 6vw, 3rem)",
  textAlign: "center",
});

export const editBtnSx = (): CSSObject => ({
  height: "60px",
  width: "300px",
  margin: "60px auto",
});

export const editBarSx = (theme: MantineTheme): CSSObject => ({
  position: "sticky",
  height: NAVBAR_HEIGHT,
  zIndex: 9999999,
  background: theme.colors.github[9],
  top: 0,
  justifyContent: "space-between",
});

export const addSectionBtnSx = (theme: MantineTheme): CSSObject => ({
  margin: `0 ${theme.spacing.md}`,
  color: theme.colors.lime[9],
  ":disabled": {
    background: theme.colors.dark[8],
    color: theme.colors.dark[4],
  },
  "@media (max-width:660px)": {
    width: 140,
    fontSize: "0.7rem",
  },
  "@media (max-width: 585px)": {
    width: "auto",
  },
});

export const warningTextSx = (theme: MantineTheme): CSSObject => ({
  margin: `${theme.spacing.xl} 0`,
  color: theme.colors.yellow[2],
  fontSize: "clamp(0.6rem, 6vw, 1rem)",
  "@media (max-width: 660px)": { fontSize: "0.75rem" },
  "@media (max-width: 410px)": { fontSize: "0.5rem" },
});

export const btnGroupSx = (theme: MantineTheme): CSSObject => ({
  margin: `${theme.spacing.md} 0`,
  "@media (max-width: 585px)": {
    gap: 1,
  },
});

export const saveBtnSx = (theme: MantineTheme): CSSObject => ({
  width: "90px",
  ":disabled": {
    background: theme.colors.dark[8],
    color: theme.colors.dark[4],
  },
  "@media (max-width:660px)": {
    width: 80,
    fontSize: "0.7rem",
  },
  "@media (max-width: 585px)": {
    width: "auto",
  },
});

export const cancelBtnSx = (theme: MantineTheme): CSSObject => ({
  width: "90px",
  color: theme.colors.dark[3],
  ":disabled": {
    background: theme.colors.dark[8],
    color: theme.colors.dark[4],
  },
  "@media (max-width:660px)": {
    width: 80,
    fontSize: "0.7rem",
  },
  "@media (max-width: 585px)": {
    width: "auto",
  },
});

export const BREAKPOINT_MD = 560;
export const BREAKPOINT_SM = 420;
