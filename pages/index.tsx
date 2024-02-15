import type { NextPage } from "next";
import { Center, Text, Button, Stack, Skeleton, Flex, ActionIcon, Tooltip, Loader } from "@mantine/core";
import { useAuth } from "../contexts/AuthProvider";
import Link from "next/link";
import { IconBrandGithub, IconBrandGithubFilled, IconBrandTwitterFilled, IconWorld } from "@tabler/icons-react";
import { Carousel } from "@mantine/carousel";
import { useRef, useState } from "react";
import Autoplay from "embla-carousel-autoplay";
import {
  footerFlexSx,
  footerIconBtnSx,
  homeCarouselTextSx,
  homeCenterSx,
  homeLoaderContainerSx,
  homeLoginBtnSx,
  homeSkeletonSx,
  homeViewPageBtnSx,
} from "../components/styles";

const Home: NextPage = () => {
  const { account, isLoading } = useAuth();
  const autoplay = useRef(Autoplay({ delay: 2000 }));

  const [redirecting, setRedirecting] = useState(false);

  return (
    <>
      <Center sx={homeCenterSx}>
        <Stack w="80%" maw={"1200px"}>
          <Carousel withIndicators={false} withControls={false} slideSize={"100%"} loop plugins={[autoplay.current]}>
            <Carousel.Slide>
              <Text sx={homeCarouselTextSx}>Organize your public repos</Text>
            </Carousel.Slide>
            <Carousel.Slide>
              <Text sx={homeCarouselTextSx}>Show off your contributions</Text>
            </Carousel.Slide>
            <Carousel.Slide>
              <Text sx={homeCarouselTextSx}>Build your own page in seconds</Text>
            </Carousel.Slide>
          </Carousel>
          {account && (
            <Button
              sx={homeViewPageBtnSx}
              component={Link}
              href={`/${account.name}`}
              variant="gradient"
              leftIcon={<IconWorld />}
              size="lg"
              onClick={() => setRedirecting(true)}
            >
              View My Page
            </Button>
          )}
          {!account && isLoading && <Skeleton sx={homeSkeletonSx} />}
          {!account && !isLoading && !redirecting && (
            <Button
              size="lg"
              sx={homeLoginBtnSx}
              leftIcon={<IconBrandGithub />}
              variant="gradient"
              component="a"
              href="/.netlify/functions/redirect"
              onClick={() => setRedirecting(true)}
            >
              Login with GitHub
            </Button>
          )}
          {!account && !isLoading && redirecting && (
            <Center sx={homeLoaderContainerSx}>
              <Loader />
            </Center>
          )}
        </Stack>
        <Center pos="absolute" bottom={20}>
          <Flex sx={footerFlexSx}>
            <Text color="dark.3">Repobullet.in - by BoilingSoup</Text>
            <Tooltip label="https://github.com/BoilingSoup">
              <ActionIcon
                mx="sm"
                component="a"
                href="https://github.com/BoilingSoup"
                target="_blank"
                aria-label="https://github.com/BoilingSoup"
                sx={footerIconBtnSx}
              >
                <IconBrandGithubFilled />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="https://twitter.com/BoilingSoupDev">
              <ActionIcon
                component="a"
                href="https://twitter.com/BoilingSoupDev"
                target="_blank"
                aria-label="https://twitter.com/BoilingSoupDev"
                sx={footerIconBtnSx}
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
