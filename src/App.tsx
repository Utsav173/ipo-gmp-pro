import { useState, useEffect, useMemo, useCallback, SetStateAction } from 'react';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useMediaQuery } from 'react-responsive';
import {
  ChevronUp,
  ChevronDown,
  ArrowUpDown,
  RefreshCcw,
  Search,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';

interface GmpDataItem {
  ipo: string;
  price: string;
  gmp: string;
  est_listing: string;
  ipo_size: string;
  lot: string;
  open: string | null;
  close: string | null;
  boa_dt: string | null;
  listing: string | null;
  gmp_updated: string;
  classname: string | null;
}

interface StatsData {
  activeIPOs: number;
  upcomingIPOs: number;
  avgGMP: number;
}

// Indian Rupee formatter
const priceFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

// Format price string to INR
const formatPrice = (price: string | null): string => {
  if (!price || price === '--') return '-';
  const numPrice = parseFloat(price.replace(/[^0-9.-]+/g, ''));
  return isNaN(numPrice) ? '-' : priceFormatter.format(numPrice);
};

// Format IPO size (handles Cr/Crore suffix)
const formatIPOSize = (size: string): string => {
  if (!size || size === '--') return '-';
  const decodedSize = decodeHTML(size);
  const numMatch = decodedSize.match(/[\d,]+\.?\d*/);
  if (!numMatch) return decodedSize;

  const numValue = parseFloat(numMatch[0].replace(/,/g, ''));
  return `${priceFormatter.format(numValue)} Cr`;
};

const decodeHTML = (html: string) => {
  const tempElement = document.createElement('div');
  tempElement.innerHTML = html;
  return tempElement.textContent || tempElement.innerText || '';
};

const parseDate = (dateStr: string | null): Date | null => {
  if (!dateStr) return null;

  // Handle "DD-MMM" format (e.g., "23-Dec")
  if (dateStr.includes('-') && !dateStr.includes(':')) {
    const [day, month] = dateStr.split('-');
    const year = new Date().getFullYear();
    return new Date(`${month} ${day}, ${year}`);
  }

  // Handle "DD-MMM HH:mm" format (e.g., "18-Dec 16:01")
  if (dateStr.includes(':')) {
    const [datePart, timePart] = dateStr.split(' ');
    const [day, month] = datePart.split('-');
    const year = new Date().getFullYear();
    return new Date(`${month} ${day}, ${year} ${timePart}`);
  }

  return null; // Unknown format
};
const formatDate = (date: Date | null): string => {
  if (!date) return '-';
  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Kolkata',
  });
};

const sortData = (
  data: GmpDataItem[],
  sortBy: string,
  sortOrder: 'asc' | 'desc'
): GmpDataItem[] => {
  return [...data].sort((a, b) => {
    let aVal = a[sortBy as keyof GmpDataItem] || '';
    let bVal = b[sortBy as keyof GmpDataItem] || '';

    // Handle numeric values
    if (sortBy === 'price' || sortBy === 'lot' || sortBy === 'ipo_size') {
      const aNum = parseFloat(aVal.toString().replace(/[^0-9.-]+/g, '')) || 0;
      const bNum = parseFloat(bVal.toString().replace(/[^0-9.-]+/g, '')) || 0;
      return sortOrder === 'asc' ? aNum - bNum : bNum - aNum;
    }

    // Handle GMP special case
    if (sortBy === 'gmp') {
      aVal = aVal === '-' ? '0' : (aVal as string);
      bVal = bVal === '-' ? '0' : (bVal as string);
      const aNum = parseFloat(aVal) || 0;
      const bNum = parseFloat(bVal) || 0;
      return sortOrder === 'asc' ? aNum - bNum : bNum - aNum;
    }

    // Handle dates
    if (
      ['open', 'close', 'boa_dt', 'listing', 'gmp_updated'].includes(sortBy)
    ) {
      const aDate = parseDate(aVal);
      const bDate = parseDate(bVal);

      if (!aDate && !bDate) return 0;
      if (!aDate) return sortOrder === 'asc' ? 1 : -1;
      if (!bDate) return sortOrder === 'asc' ? -1 : 1;

      return sortOrder === 'asc'
        ? aDate.getTime() - bDate.getTime()
        : bDate.getTime() - aDate.getTime();
    }

    // Default string comparison
    return sortOrder === 'asc'
      ? aVal.toString().localeCompare(bVal.toString())
      : bVal.toString().localeCompare(aVal.toString());
  });
};
export default function App() {
  const [gmpData, setGmpData] = useState<GmpDataItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>('ipo');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [cache, setCache] = useState<{
    data: GmpDataItem[];
    timestamp: number;
  } | null>(null);

  const isMobile = useMediaQuery({ query: '(max-width: 768px)' });
  const cacheDuration = 300000; // 5 minutes in milliseconds

  const fetchData = useCallback(async () => {
    if (cache && Date.now() - cache.timestamp < cacheDuration) {
      setGmpData(cache.data);
      setLoading(false);
      setRefreshing(false);
      return;
    }
    try {
      setRefreshing(true);
      const response = await fetch(
        'https://gmp-extractor.khatriutsav63.workers.dev/'
      );
      if (!response.ok)
        throw new Error(`Failed to fetch data. Status: ${response.status}`);
      const data = await response.json();
      setGmpData(data.data);
      setCache({ data: data.data, timestamp: Date.now() });
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'An unknown error occurred'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [cache, cacheDuration]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, cacheDuration); // Refresh every 5 minutes
    return () => clearInterval(interval);
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
        .filter((item) => item.gmp !== '-')
        .reduce((acc, curr) => acc + (parseFloat(curr.gmp) || 0), 0) /
      gmpData.length;

    return { activeIPOs, upcomingIPOs, avgGMP };
  }, [gmpData]);

  const handleSort = (column: string) => {
    setSortOrder((prevOrder) =>
      sortBy === column ? (prevOrder === 'asc' ? 'desc' : 'asc') : 'asc'
    );
    setSortBy(column);
  };

  const renderStats = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <Card>
        <CardHeader className="p-4">
          <CardTitle className="text-lg">Active IPOs</CardTitle>
          <CardDescription>Currently open for subscription</CardDescription>
        </CardHeader>
        <CardContent className="pt-0 px-4 pb-4">
          <div className="text-2xl font-bold">{statsData.activeIPOs}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="p-4">
          <CardTitle className="text-lg">Upcoming IPOs</CardTitle>
          <CardDescription>Opening soon</CardDescription>
        </CardHeader>
        <CardContent className="pt-0 px-4 pb-4">
          <div className="text-2xl font-bold">{statsData.upcomingIPOs}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="p-4">
          <CardTitle className="text-lg">Average GMP</CardTitle>
          <CardDescription>Current market premium</CardDescription>
        </CardHeader>
        <CardContent className="pt-0 px-4 pb-4">
          <div className="text-2xl font-bold">
            {priceFormatter.format(statsData.avgGMP)}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderSearchAndControls = () => (
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
          <Select onValueChange={(value: SetStateAction<string>) => setSortBy(value)} value={sortBy}>
            <SelectTrigger className="w-[50%]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ipo">Company Name</SelectItem>
              <SelectItem value="price">Price</SelectItem>
              <SelectItem value="gmp">GMP</SelectItem>
              <SelectItem value="lot">Lot Size</SelectItem>
              <SelectItem value="open">Open Date</SelectItem>
              <SelectItem value="close">Close Date</SelectItem>
            </SelectContent>
          </Select>
          <Select
            onValueChange={(value: string) =>
              setSortOrder(value as 'asc' | 'desc')
            }
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
          className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`}
        />
        Refresh
      </button>
    </div>
  );

  const renderMobileView = () => (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 space-y-4"
      >
        {renderStats()}
        {renderSearchAndControls()}
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
                        {decodeHTML(item.ipo)}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {formatPrice(item.price)} • {item.lot} Shares
                      </span>
                    </div>
                    <Badge
                      variant={
                        parseFloat(item.gmp) > 0 ? 'default' : 'secondary'
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
                          {formatDate(parseDate(item.open))} -{' '}
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

  const renderDesktopView = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full p-4"
    >
      {renderStats()}
      {renderSearchAndControls()}
      <Card>
        <Table>
          <TableCaption className="text-lg font-semibold text-primary">
            Live IPO GMP (Grey Market Premium) Data
          </TableCaption>
          <TableHeader>
            <TableRow>
              {[
                { key: 'ipo', label: 'IPO' },
                { key: 'price', label: 'Price' },
                { key: 'gmp', label: 'GMP' },
                { key: 'est_listing', label: 'Est. Listing' },
                { key: 'ipo_size', label: 'IPO Size' },
                { key: 'lot', label: 'Lot Size' },
                { key: 'open', label: 'Open' },
                { key: 'close', label: 'Close' },
                { key: 'boa_dt', label: 'Allotment' },
                { key: 'listing', label: 'Listing' },
                { key: 'gmp_updated', label: 'Updated' },
              ].map(({ key, label }) => (
                <TableHead
                  key={key}
                  className="cursor-pointer hover:bg-accent/50"
                  onClick={() => handleSort(key)}
                >
                  <div className="flex items-center space-x-2">
                    <span>{label}</span>
                    {sortBy === key ? (
                      sortOrder === 'asc' ? (
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
                  {decodeHTML(item.ipo)}
                </TableCell>
                <TableCell>{formatPrice(item.price)}</TableCell>
                <TableCell>
                  <Badge
                    variant={parseFloat(item.gmp) > 0 ? 'default' : 'secondary'}
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
                Data sourced from{' '}
                <a href="https://investorgain.com" className="underline">
                  investorgain.com
                </a>{' '}
                • Auto-refreshes every 5 minutes
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </Card>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader className="p-4">
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-3 w-[140px]" />
              </CardHeader>
              <CardContent className="p-4">
                <Skeleton className="h-8 w-[60px]" />
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <Table>
            <TableCaption className="text-lg font-semibold text-primary">
              Live IPO GMP (Grey Market Premium) Data
            </TableCaption>
            <TableHeader>
              <TableRow>
                {Array.from({ length: 11 }).map((_, index) => (
                  <TableHead key={index}>
                    <Skeleton className="h-4 w-full" />
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 10 }).map((_, index) => (
                <TableRow key={index}>
                  {Array.from({ length: 11 }).map((_, index) => (
                    <TableCell key={index}>
                      <Skeleton className="h-8 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 space-y-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-lg font-semibold text-primary">
              An error occurred
            </div>
            <div className="text-muted-foreground">{error}</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return isMobile ? renderMobileView() : renderDesktopView();
}
