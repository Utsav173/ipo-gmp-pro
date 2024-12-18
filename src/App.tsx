import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useMediaQuery } from "react-responsive";

interface GmpDataItem {
  ipo: string;
  price: string;
  gmp: string;
  est_listing: string;
  ipo_size: string;
  lot: string;
  open: string;
  close: string;
  boa_dt: string;
  listing: string;
  gmp_updated: string;
  classname: string;
}

const decodeHTML = (html: string) => {
  const tempElement = document.createElement("div");
  tempElement.innerHTML = html;
  return tempElement.textContent || tempElement.innerText || "";
};

export default function App() {
  const [gmpData, setGmpData] = useState<GmpDataItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isMobile = useMediaQuery({ query: "(max-width: 768px)" });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          "https://gmp-extractor.khatriutsav63.workers.dev/"
        );
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        setGmpData(data.data);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <div className="mx-auto mt-2">Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  const renderMobileView = () => (
    <div className="p-4 space-y-4">
      <Accordion type="single" collapsible className="w-full">
        {gmpData.map((item) => (
          <AccordionItem key={item.ipo} value={item.ipo}>
            <AccordionTrigger
              className={`hover:bg-accent truncate ${item.classname?.startsWith('color-')
                  ? `bg-${item.classname}`
                  : 'bg-white'
                }`}
            >
              <div className="flex items-center justify-between w-[85vw]">
                <span
                  className="truncate block max-w-full"
                  title={decodeHTML(item.ipo)}
                >
                  {decodeHTML(item.ipo)}
                </span>
                <span className="min-w-14 text-center bg-blue-100 text-blue-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300 ml-2">
                  &#x20B9;{item.gmp}
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="font-semibold">Price:</div>
                <div>{item.price}</div>
                <div className="font-semibold">Est. Listing:</div>
                <div>{item.est_listing}</div>
                <div className="font-semibold">IPO Size:</div>
                <div>{decodeHTML(item.ipo_size)}</div>
                <div className="font-semibold">Lot Size:</div>
                <div>{item.lot}</div>
                <div className="font-semibold">Open:</div>
                <div>{item.open}</div>
                <div className="font-semibold">Close:</div>
                <div>{item.close}</div>
                <div className="font-semibold">Basis of Allotment Date:</div>
                <div>{item.boa_dt}</div>
                <div className="font-semibold">Listing:</div>
                <div>{item.listing}</div>
                <div className="font-semibold">GMP Updated:</div>
                <div>{item.gmp_updated}</div>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );

  const renderDesktopView = () => (
    <div className="w-full p-4">
      <Table className="border border-muted rounded-lg shadow-lg">
        <TableCaption className="text-lg font-semibold text-primary">
          Live IPO GMP (Grey Market Premium) Data
        </TableCaption>
        <TableHeader className="bg-muted">
          <TableRow>
            <TableHead>IPO</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>GMP</TableHead>
            <TableHead>Est. Listing</TableHead>
            <TableHead>IPO Size</TableHead>
            <TableHead>Lot Size</TableHead>
            <TableHead>Open</TableHead>
            <TableHead>Close</TableHead>
            <TableHead>Basis of Allotment</TableHead>
            <TableHead>Listing</TableHead>
            <TableHead>GMP Updated</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {gmpData.map((item) => (
            <TableRow
              key={item.ipo}
              className={`hover:bg-accent ${item.classname?.startsWith("color-") ? `bg-${item.classname}` : "bg-white"}`}
            >
              <TableCell className="font-medium">{decodeHTML(item.ipo)}</TableCell>
              <TableCell>{item.price}</TableCell>
              <TableCell>&#x20B9;{item.gmp}</TableCell>
              <TableCell>{item.est_listing}</TableCell>
              <TableCell>{decodeHTML(item.ipo_size)}</TableCell>
              <TableCell>{item.lot}</TableCell>
              <TableCell>{item.open}</TableCell>
              <TableCell>{item.close}</TableCell>
              <TableCell>{item.boa_dt}</TableCell>
              <TableCell>{item.listing}</TableCell>
              <TableCell>{item.gmp_updated}</TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter className="bg-muted">
          <TableRow>
            <TableCell colSpan={11} className="text-center">
              Data sourced from{' '}
              <a href="https://investorgain.com" className="underline">
                investorgain.com
              </a>
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );

  return isMobile ? renderMobileView() : renderDesktopView();
}
