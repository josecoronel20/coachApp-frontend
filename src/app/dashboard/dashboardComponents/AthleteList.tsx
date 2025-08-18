import { useCoachStore } from "@/store/coachStore";
import { Athlete } from "@/types/athlete";
import React, { useEffect, useState } from "react";
import { AthleteCard } from "./AthleteCard";

const AthleteList = ({ searchQuery }: { searchQuery: string }) => {
  const { athletesInfo } = useCoachStore();
  const [currentAthletes, setCurrentAthletes] = useState<Athlete[]>(
    athletesInfo || []
  );

  // Filter athletes based on search query
  useEffect(() => {
    if (searchQuery && athletesInfo) {
      setCurrentAthletes(
        athletesInfo?.filter((athlete) =>
          athlete.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    } else {
      setCurrentAthletes(athletesInfo || []);
    }
  }, [searchQuery, athletesInfo]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-4">
      {currentAthletes.map((athlete) => (
        <AthleteCard key={athlete.id} athlete={athlete} />
      ))}
    </div>
  );
};

export default AthleteList;
