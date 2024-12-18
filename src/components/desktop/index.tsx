import { lazy } from "react";
import { motion } from "framer-motion";

import { Card } from "../ui/card";
import {
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
  Table,
} from "../ui/table";
import { ArrowUpDown, ChevronDown, ChevronUp } from "lucide-react";
import {
  formatDate,
  formatIPOSize,
  formatPrice,
  parseDate,
} from "@/lib/utils";
import { GmpDataItem, SearchAndControlsProps, StatsData } from "@/types";
import { Badge } from "../ui/badge";
import IPOText from "../common/IPOText";

const Stats = lazy(() => import("../common/Stats"));
const SearchAndControls = lazy(() => import("../common/SearchAndControls"));

/**
 * A table component for desktop devices that displays the IPO GMP data.
 *
 * It presents the data in a tabular format with sortable columns. The component
 * facilitates user interaction for searching and sorting IPO data, and displays
 * statistical information. It uses framer motion for animations and integrates
 * search and control functionalities.
 *
 * @param {{filteredAndSortedData: GmpDataItem[]; refreshing: boolean; searchTerm: string; setSearchTerm: (value: SetStateAction<string>) => void; sortBy: SortBy; setSortBy: (value: SetStateAction<SortBy>) => void; sortOrder: "asc" | "desc"; setSortOrder: (value: SetStateAction<"asc" | "desc">) => void; statsData: StatsData; fetchData: VoidFunction; handleSort: (column: string) => void;}} props
 * @returns {JSX.Element}
 */
const DeskTopTable = ({
  filteredAndSortedData,
  refreshing,
  searchTerm,
  setSearchTerm,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
  statsData,
  fetchData,
  handleSort,
}: SearchAndControlsProps & {
  filteredAndSortedData: GmpDataItem[];
  statsData: StatsData;
  handleSort: (column: string) => void;
}) => {

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full p-4"
    >
      <Stats statsData={statsData} key={"desktop-view-stats"} />
      <SearchAndControls
        fetchData={fetchData}
        refreshing={refreshing}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        sortBy={sortBy}
        setSortBy={setSortBy}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
        key={"desktop-view-controls"}
      />
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              {[
                { key: "ipo", label: "IPO" },
                { key: "price", label: "Price" },
                { key: "gmp", label: "GMP" },
                { key: "est_listing", label: "Est. Listing" },
                { key: "ipo_size", label: "IPO Size" },
                { key: "lot", label: "Lot Size" },
                { key: "open", label: "Open" },
                { key: "close", label: "Close" },
                { key: "boa_dt", label: "Allotment" },
                { key: "listing", label: "Listing" },
                { key: "gmp_updated", label: "Updated" },
              ].map(({ key, label }) => (
                <TableHead
                  key={key}
                  className="cursor-pointer hover:bg-accent/50"
                  onClick={() => handleSort(key)}
                >
                  <div className="flex items-center space-x-2">
                    <span>{label}</span>
                    {sortBy === key ? (
                      sortOrder === "asc" ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )
                    ) : (
                      <ArrowUpDown className="w-4 h-4 opacity-50" />
                    )}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedData.map((item, index) => (
              <motion.tr
                key={item.ipo}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`hover:bg-accent ${item.classname}`}
              >
                <TableCell className="font-medium">
                  <IPOText ipoString={item.ipo} key={item.ipo} />
                </TableCell>
                <TableCell>{formatPrice(item.price)}</TableCell>
                <TableCell>
                  <Badge
                    variant={parseFloat(item.gmp) > 0 ? "default" : "secondary"}
                  >
                    {formatPrice(item.gmp)}
                  </Badge>
                </TableCell>
                <TableCell>{item.est_listing}</TableCell>
                <TableCell>{formatIPOSize(item.ipo_size)}</TableCell>
                <TableCell>{item.lot}</TableCell>
                <TableCell>{formatDate(parseDate(item.open))}</TableCell>
                <TableCell>{formatDate(parseDate(item.close))}</TableCell>
                <TableCell>{formatDate(parseDate(item.boa_dt))}</TableCell>
                <TableCell>{formatDate(parseDate(item.listing))}</TableCell>
                <TableCell>{formatDate(parseDate(item.gmp_updated))}</TableCell>
              </motion.tr>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={11} className="text-center">
                Data sourced from the Varise website. The data auto-refreshes
                every 5 minutes.
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </Card>
    </motion.div>
  );
};

export default DeskTopTable;
