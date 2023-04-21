import { NextPage } from "next";
import { useRouter } from "next/router";

const User: NextPage = () => {
  const router = useRouter();

  return (
    <>
      <a href="http://localhost:8888/.netlify/functions/login">
        login to github
      </a>
      <div>testtest</div>
      <div>{JSON.stringify(router.query)}</div>
    </>
  );
};

export default User;
