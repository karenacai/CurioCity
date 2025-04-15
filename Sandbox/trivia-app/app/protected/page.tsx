import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import TriviaButton from "@/app/protected/TriviaButton";

export default async function ProtectedPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-12 px-8 max-w-2xl mx-auto text-center">
      <div className="flex flex-col gap-4 items-center mt-8">
        <h2 className="font-bold text-2xl">Trivia Questions</h2>
        <p className="text-muted-foreground">Select categories, set the difficulty range, and generate trivia questions</p>
        <TriviaButton />
      </div>
    </div>
  );
}
