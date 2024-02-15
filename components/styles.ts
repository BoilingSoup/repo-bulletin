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

export const deleteDenyBtnSx = (theme: MantineTheme) => ({
  ...settingsBtnSx(),
  backgroundColor: theme.colors.red[5],
  ":hover": {
    backgroundColor: theme.colors.red[6],
  },
});
