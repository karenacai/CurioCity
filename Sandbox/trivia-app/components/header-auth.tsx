import { signOutAction } from "@/app/actions";
import Link from "next/link";
import { Button } from "./ui/button";
import { createClient } from "@/utils/supabase/server";
import { Heart, History } from "lucide-react";

export default async function AuthButton() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user ? (
    <div className="flex items-center gap-4">
      <Button asChild variant="ghost" size="sm" className="text-sm">
        <Link href="/protected/favorites" className="flex items-center gap-1">
          <Heart className="h-4 w-4" /> Favorites
        </Link>
      </Button>
      <Button asChild variant="ghost" size="sm" className="text-sm">
        <Link href="/protected/history" className="flex items-center gap-1">
          <History className="h-4 w-4" /> History
        </Link>
      </Button>
      <span>
        {user.email}
      </span>
      <form action={signOutAction}>
        <Button type="submit" variant={"outline"}>
          Sign out
        </Button>
      </form>
    </div>
  ) : (
    <div className="flex gap-2">
      <Button asChild size="sm" variant={"outline"}>
        <Link href="/sign-in">Sign in</Link>
      </Button>
      <Button asChild size="sm" variant={"default"}>
        <Link href="/sign-up">Sign up</Link>
      </Button>
    </div>
  );
}
