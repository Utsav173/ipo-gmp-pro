import {
  useState,
  useEffect,
  useMemo,
  useCallback,
  lazy,
  Suspense,
  useRef,
} from "react";
import { Card, CardContent } from "@/components/ui/card";
import { decodeHTML, parseDate, sortData } from "./lib/utils";

import { useMediaQuery } from "react-responsive";
import { GmpDataItem, SortBy, StatsData } from "./types";

import Loader from "./components/common/Loader";

const MobileTable = lazy(() => import("./components/mobile"));
const DeskTopTable = lazy(() => import("./components/desktop"));

export default function App() {
  const [gmpData, setGmpData] = useState<GmpDataItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortBy>(SortBy.OPEN);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [searchTerm, setSearchTerm] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const cache = useRef<{
    data: GmpDataItem[];
    timestamp: number;
  } | null>(null);

  const isInitialFetch = useRef(true);
  const isMobile = useMediaQuery({ query: "(max-width: 768px)" });
  const cacheDuration = 7200000; // 120 minutes in milliseconds

  const fetchApiData = async () => {
    try {
      const response = await fetch(
        "https://gmp-extractor.khatriutsav63.workers.dev/"
      );
      if (!response.ok) {
        throw new Error(`Failed to fetch data. Status: ${response.status}`);
      }
      return await response.json();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
      return null;
    }
  };

  const fetchData = useCallback(
    async (forceRefresh = false) => {
      if (
        cache.current &&
        Date.now() - cache.current.timestamp < cacheDuration &&
        !forceRefresh
      ) {
        setGmpData(cache.current.data);
        setLoading(false);
        setRefreshing(false);
        return;
      }
      setRefreshing(true);
      const response = await fetchApiData();
      if (response) {
        cache.current = { data: response.data, timestamp: Date.now() };
        setGmpData(response.data);
        setError(null);
      }

      setLoading(false);
      setRefreshing(false);
    },
    [cacheDuration]
  );

  useEffect(() => {
    const loadData = async () => {
      if (isInitialFetch.current) {
        isInitialFetch.current = false;
        await fetchData();
      }
    };
    loadData();

    const intervalId = setInterval(fetchData, cacheDuration);

    return () => clearInterval(intervalId);
  }, [fetchData, cacheDuration]);

  const filteredAndSortedData = useMemo(() => {
    return sortData(
      gmpData.filter((item) =>
        decodeHTML(item.ipo).toLowerCase().includes(searchTerm.toLowerCase())
      ),
      sortBy,
      sortOrder
    );
  }, [gmpData, searchTerm, sortBy, sortOrder]);

  const statsData = useMemo<StatsData>(() => {
    const now = new Date();
    const activeIPOs = gmpData.filter((item) => {
      const openDate = parseDate(item.open);
      return openDate && openDate > now && !item.listing;
    }).length;

    const upcomingIPOs = gmpData.filter((item) => {
      const openDate = parseDate(item.open);
      return !openDate || openDate > now;
    }).length;
    const avgGMP =
      gmpData
        .filter((item) => item.gmp !== "-")
        .reduce((acc, curr) => acc + (parseFloat(curr.gmp) || 0), 0) /
      gmpData.filter((item) => item.gmp !== "-").length;

    return { activeIPOs, upcomingIPOs, avgGMP };
  }, [gmpData]);

  const handleSort = (column: string) => {
    setSortOrder((prevOrder) =>
      sortBy === column ? (prevOrder === "asc" ? "desc" : "asc") : "asc"
    );
    setSortBy(SortBy[column as keyof typeof SortBy]);
  };

  const handleRefresh = () => {
    fetchData(true);
  };

  if (loading) {
    return <Loader isMobile={isMobile} />;
  }
  if (error) {
    return (
      <div className="p-4 space-y-4">
        <Card>
          <CardContent className="p-4">
            <div className="tfont-semibold text-primary">An error occurred</div>
            <div className="text-muted-foreground">{error}</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <Suspense fallback={<Loader isMobile={isMobile} />}>
      {isMobile ? (
        <MobileTable
          filteredAndSortedData={filteredAndSortedData}
          refreshing={refreshing}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          sortBy={sortBy}
          setSortBy={setSortBy}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
          statsData={statsData}
          fetchData={handleRefresh}
        />
      ) : (
        <DeskTopTable
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          sortBy={sortBy}
          setSortBy={setSortBy}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
          statsData={statsData}
          fetchData={handleRefresh}
          refreshing={refreshing}
          filteredAndSortedData={filteredAndSortedData}
          handleSort={handleSort}
        />
      )}
    </Suspense>
  );
}
