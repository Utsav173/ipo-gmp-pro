import { motion, AnimatePresence } from "framer-motion";
import { lazy } from "react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import {
  decodeHTML,
  formatDate,
  formatIPOSize,
  formatPrice,
  parseDate,
} from "@/lib/utils";
import { Badge } from "../ui/badge";
import { Card, CardContent } from "../ui/card";
import { GmpDataItem, SearchAndControlsProps, StatsData } from "@/types";
import IPOText from "../common/IPOText";

const Stats = lazy(() => import("../common/Stats"));
const SearchAndControls = lazy(() => import("../common/SearchAndControls"));

/**
 * A table component for mobile devices, that displays the IPO GMP data.
 *
 * It displays the data in an accordion format, with each item in the list
 * being a single accordion item. The item contains the IPO name, price, gmp,
 * and other details. The details are displayed in a card component.
 *
 * The component uses framer motion to animate the accordion items, and
 * the `AnimatePresence` component to animate the accordion items when they
 * are added or removed from the list.
 *
 * The component also uses the `Accordion` component from the `@radix-ui/react-accordion`
 * library to create the accordion.
 *
 * @param {{filteredAndSortedData: GmpDataItem[]; refreshing: boolean; searchTerm: string; setSearchTerm: (value: SetStateAction<string>) => void; sortBy: SortBy; setSortBy: (value: SetStateAction<SortBy>) => void; sortOrder: "asc" | "desc"; setSortOrder: (value: SetStateAction<"asc" | "desc">) => void; statsData: StatsData; fetchData: VoidFunction}} props
 * @returns {JSX.Element}
 */
const MobileTable = ({
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
}: SearchAndControlsProps & {
  filteredAndSortedData: GmpDataItem[];
  statsData: StatsData;
}) => {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 space-y-4"
      >
        <Stats statsData={statsData} key={"mobile-view-stats"} />
        <SearchAndControls
          fetchData={fetchData}
          isMobile
          refreshing={refreshing}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          sortBy={sortBy}
          setSortBy={setSortBy}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
          key={"mobile-view-controls"}
        />
        <Accordion type="single" collapsible className="w-full">
          {filteredAndSortedData.map((item, index) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              key={item.ipo}
            >
              <AccordionItem value={item.ipo}>
                <AccordionTrigger
                  className={`hover:bg-accent rounded-lg p-4 ${item.classname}`}
                >
                  <div className="flex items-center justify-between w-full pr-4">
                    <div className="flex flex-col items-start">
                      <span
                        className="font-medium text-left"
                        title={decodeHTML(item.ipo)}
                      >
                        <IPOText ipoString={item.ipo} />
                      </span>
                      <span className="text-sm text-black text-opacity-60">
                        {formatPrice(item.price)} • {item.lot} Shares
                      </span>
                    </div>
                    <Badge
                      variant={
                        parseFloat(item.gmp) > 0 ? "default" : "secondary"
                      }
                    >
                      {formatPrice(item.gmp)}
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <Card className="mt-2">
                    <CardContent className="grid grid-cols-2 gap-4 p-4">
                      <div>
                        <div className="text-sm font-medium mb-1">IPO Size</div>
                        <div>{formatIPOSize(item.ipo_size)}</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium mb-1">
                          Est. Listing
                        </div>
                        <div>{item.est_listing}</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium mb-1">
                          Open/Close
                        </div>
                        <div>
                          {formatDate(parseDate(item.open))} -{" "}
                          {formatDate(parseDate(item.close))}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-medium mb-1">
                          Listing Date
                        </div>
                        <div>{formatDate(parseDate(item.listing))}</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium mb-1">
                          Allotment Date
                        </div>
                        <div>{formatDate(parseDate(item.boa_dt))}</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium mb-1">
                          Last Updated
                        </div>
                        <div>{formatDate(parseDate(item.gmp_updated))}</div>
                      </div>
                    </CardContent>
                  </Card>
                </AccordionContent>
              </AccordionItem>
            </motion.div>
          ))}
        </Accordion>
      </motion.div>
    </AnimatePresence>
  );
};

export default MobileTable;
