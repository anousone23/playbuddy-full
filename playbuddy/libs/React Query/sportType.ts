import { getAllSportTypes } from "@/api/sportType";
import { ISportType } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

export function useGetAllSportTypes() {
  const query = useQuery<ISportType[], Error>({
    queryKey: ["sportTypes"],
    queryFn: getAllSportTypes,
  });

  useEffect(() => {
    if (query.isError) {
      console.log("Error from useGetAllSportTypes", query.error?.message);
    }
  }, [query.isError, query.error]);

  return query;
}
