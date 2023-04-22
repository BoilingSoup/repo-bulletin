import type { NextPage } from "next";
import Head from "next/head";
import {
  Center,
  Text,
  Button,
  Stack,
  Skeleton,
  CSSObject,
  MantineTheme,
  Flex,
  ActionIcon,
  Tooltip,
} from "@mantine/core";
import { useAuth } from "../contexts/AuthProvider";
import Link from "next/link";
import {
  IconBrandGithub,
  IconBrandGithubFilled,
  IconBrandTwitterFilled,
  IconWorld,
} from "@tabler/icons-react";
import { Carousel } from "@mantine/carousel";
import { useRef } from "react";
import Autoplay from "embla-carousel-autoplay";

const Home: NextPage = () => {
  const { account, isLoading } = useAuth();
  const autoplay = useRef(Autoplay({ delay: 2000 }));

  return (
    <>
      <Head>
        <title>test</title>
      </Head>
      <Center
        sx={(theme) => ({
          width: "100vw",
          height: "100vh",
          background: theme.colors.github[9],
          position: "relative",
        })}
      >
        <Stack w="80%" maw={"1200px"}>
          <Carousel
            withIndicators={false}
            withControls={false}
            slideSize={"100%"}
            loop
            plugins={[autoplay.current]}
          >
            <Carousel.Slide>
              <Text color="dark.1" size="4rem" align="center">
                Organize your public repos.
              </Text>
            </Carousel.Slide>
            <Carousel.Slide>
              <Text color="dark.1" size="4rem" align="center">
                Show off your contributions.
              </Text>
            </Carousel.Slide>
            <Carousel.Slide>
              <Text color="dark.1" size="4rem" align="center">
                Build your own page in seconds.
              </Text>
            </Carousel.Slide>
          </Carousel>
          {account && (
            <Button
              h="60px"
              w="300px"
              my="60px"
              mx="auto"
              component={Link}
              href={`/${account.name}`}
              variant="gradient"
              leftIcon={<IconWorld />}
              size="lg"
            >
              View My Page
            </Button>
          )}
          {!account && isLoading && (
            <Skeleton
              h="60px"
              w="300px"
              my="60px"
              mx="auto"
              sx={({ colors }: MantineTheme): CSSObject => ({
                ":before": {
                  background: colors.dark[5],
                },
                ":after": {
                  background: colors.dark[7],
                },
              })}
            />
          )}
          {!account && !isLoading && (
            <Button
              h="60px"
              w="300px"
              my="60px"
              mx="auto"
              size="lg"
              leftIcon={<IconBrandGithub />}
              color="dark.3"
              component="a"
              href="/.netlify/functions/redirect"
            >
              Login with GitHub
            </Button>
          )}
        </Stack>
        <Center pos="absolute" bottom={20}>
          <Flex align={"center"}>
            <Text color="dark.3">Repobullet.in - made by BoilingSoup</Text>
            <Tooltip label="https://github.com/BoilingSoup">
              <ActionIcon
                color="dark.3"
                mx="sm"
                component="a"
                href="https://github.com/BoilingSoup"
                target="_blank"
                sx={{
                  ":hover": {
                    background: "none",
                  },
                }}
              >
                <IconBrandGithubFilled />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="https://twitter.com/BoilingSoupDev">
              <ActionIcon
                color="dark.3"
                component="a"
                href="https://twitter.com/BoilingSoupDev"
                target="_blank"
                sx={{
                  ":hover": {
                    background: "none",
                  },
                }}
              >
                <IconBrandTwitterFilled />
              </ActionIcon>
            </Tooltip>
          </Flex>
        </Center>
      </Center>
    </>
  );
};

export default Home;
