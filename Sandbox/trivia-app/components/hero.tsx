export default function Header() {
  return (
    <div className="flex flex-col gap-8 items-center">
      <h1 className="text-4xl font-bold">Trivia App</h1>
      <p className="text-xl lg:text-2xl !leading-tight mx-auto max-w-xl text-center">
        Test your knowledge with fun trivia questions
      </p>
      <div className="w-full p-[1px] bg-gradient-to-r from-transparent via-foreground/10 to-transparent my-8" />
    </div>
  );
}
