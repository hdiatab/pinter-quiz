import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useSelector } from "react-redux";

export default function HomePage() {
  const quiz = useSelector((s: any) => s.quiz);

  const hasInProgress = quiz?.status === "in_progress" && quiz?.questions?.length > 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Let’s continue a quiz</h1>
        <p className="text-muted-foreground text-sm">Pick a category or resume your current quiz.</p>
      </div>

      {/* Continue card */}
      <Card>
        <CardHeader>
          <CardTitle>Continue</CardTitle>
          <CardDescription>
            {hasInProgress ? `Progress: ${quiz.answeredCount}/${quiz.totalCount} answered` : "No quiz in progress"}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between gap-4">
          <div className="text-sm text-muted-foreground">
            {hasInProgress ? (
              <>
                Total questions: <span className="text-foreground font-medium">{quiz.totalCount}</span> · Answered:{" "}
                <span className="text-foreground font-medium">{quiz.answeredCount}</span>
              </>
            ) : (
              "Start a new quiz from the list below."
            )}
          </div>

          {hasInProgress ? (
            <Button asChild>
              <Link to="/quiz">Resume</Link>
            </Button>
          ) : (
            <Button asChild variant="secondary">
              <Link to="/quiz">Start New</Link>
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Friends (dummy) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium">My Friends</h2>
          <Button variant="ghost" size="sm">
            See all
          </Button>
        </div>
        <div className="flex gap-3">
          {["AA", "BM", "CR", "DY", "EZ"].map((x) => (
            <Avatar key={x}>
              <AvatarFallback>{x}</AvatarFallback>
            </Avatar>
          ))}
        </div>
      </div>

      <Separator />

      {/* Categories */}
      <div className="space-y-2">
        <h2 className="text-sm font-medium">Category</h2>
        <Tabs defaultValue="all">
          <TabsList className="rounded-full">
            <TabsTrigger className="rounded-full" value="all">
              All
            </TabsTrigger>
            <TabsTrigger className="rounded-full" value="science">
              Science
            </TabsTrigger>
            <TabsTrigger className="rounded-full" value="math">
              Math
            </TabsTrigger>
            <TabsTrigger className="rounded-full" value="music">
              Music
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Latest quiz */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium">Latest Quiz</h2>
          <Button variant="ghost" size="sm">
            See all
          </Button>
        </div>

        <div className="grid gap-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">General Trivia</CardTitle>
              <CardDescription>OpenTDB · Random questions</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-end">
              <Button asChild>
                <Link to="/quiz">Start</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Science Mix</CardTitle>
              <CardDescription>OpenTDB · Random questions</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-end">
              <Button asChild variant="secondary">
                <Link to="/quiz">Start</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
