import { RefreshCcw, Search } from "lucide-react";
import { SetStateAction } from "react";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { SearchAndControlsProps, SortBy, SortOrder } from "@/types";

const SearchAndControls = ({
  searchTerm,
  setSearchTerm,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
  isMobile = false,
  fetchData,
  refreshing,
}: SearchAndControlsProps) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search IPOs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-8"
        />
      </div>
      {isMobile && (
        <div className="flex gap-2 w-full">
          <Select
            onValueChange={(value: SetStateAction<string>) =>
              setSortBy(value as SortBy)
            }
            value={sortBy}
          >
            <SelectTrigger className="w-[50%]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ipo">Company Name</SelectItem>
              <SelectItem value="price">Price</SelectItem>
              <SelectItem value="gmp">GMP</SelectItem>
              <SelectItem value="est_listing">Estimated Listing</SelectItem>
              <SelectItem value="ipo_size">IPO Size</SelectItem>
              <SelectItem value="lot">Lot Size</SelectItem>
              <SelectItem value="open">Open Date</SelectItem>
              <SelectItem value="close">Close Date</SelectItem>
              <SelectItem value="boa_dt">BOA Date</SelectItem>
              <SelectItem value="listing">Listing</SelectItem>
              <SelectItem value="gmp_updated">GMP Updated</SelectItem>
            </SelectContent>
          </Select>
          <Select
            onValueChange={(value: SortOrder) => setSortOrder(value)}
            value={sortOrder}
          >
            <SelectTrigger className="w-[50%]">
              <SelectValue placeholder="Sort order" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="asc">Ascending</SelectItem>
              <SelectItem value="desc">Descending</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
      <button
        onClick={fetchData}
        disabled={refreshing}
        className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
      >
        <RefreshCcw
          className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
        />
        Refresh
      </button>
    </div>
  );
};

export default SearchAndControls;
