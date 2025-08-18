"use client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface AthleteViewHeaderProps {
  athleteName: string
  coachName?: string
}

export function AthleteViewHeader({ athleteName, coachName = "Tu Entrenador" }: AthleteViewHeaderProps) {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 justify-between shadow-sm">
      <div className="flex items-center gap-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src="/placeholder-user.jpg" alt="Coach Avatar" />
          <AvatarFallback>{coachName.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        <span className="text-sm font-medium text-muted-foreground">Entrenador: {coachName}</span>
      </div>
      <h1 className="text-xl font-semibold text-foreground truncate">{athleteName}</h1>
    </header>
  )
}
