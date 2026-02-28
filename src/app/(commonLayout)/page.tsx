import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { userService } from "@/services/user.service";
import { cookies } from "next/headers";


export default async function Home() {
  // const {data } = await userService.getSession();
  // console.log(data);

  return (
    <div>Home <br />
      <Button>Click me</Button>
    </div>
  );
}
