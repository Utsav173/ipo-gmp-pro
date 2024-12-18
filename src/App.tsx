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
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  const renderMobileView = () => (
    <div className="p-4">
      {/* Add padding to the container of the Accordion */}
      <Accordion type="single" collapsible className="w-full">
        {gmpData.map((item) => (
          <AccordionItem key={item.ipo} value={item.ipo}>
            <AccordionTrigger className={item.classname}>
              {item.ipo}
            </AccordionTrigger>
            <AccordionContent>
              <div className="grid grid-cols-2 gap-4">
                <div>Price: {item.price}</div>
                <div>GMP: {item.gmp}</div>
                <div>Est. Listing: {item.est_listing}</div>
                <div>IPO Size: {decodeHTML(item.ipo_size)}</div>
                <div>Lot Size: {item.lot}</div>
                <div>Open: {item.open}</div>
                <div>Close: {item.close}</div>
                <div>Basis of Allotment Date: {item.boa_dt}</div>
                <div>Listing: {item.listing}</div>
                <div>GMP Updated: {item.gmp_updated}</div>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );

  const renderDesktopView = () => (
    <div className="w-full overflow-x-auto">
      <Table>
        <TableCaption>Live IPO GMP (Grey Market Premium) Data</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="whitespace-nowrap">IPO</TableHead>
            <TableHead className="whitespace-nowrap hidden sm:table-cell">
              Price
            </TableHead>
            <TableHead className="whitespace-nowrap hidden sm:table-cell">
              GMP
            </TableHead>
            <TableHead className="whitespace-nowrap hidden sm:table-cell">
              Est. Listing
            </TableHead>
            <TableHead className="whitespace-nowrap hidden md:table-cell">
              IPO Size
            </TableHead>
            <TableHead className="whitespace-nowrap hidden md:table-cell">
              Lot Size
            </TableHead>
            <TableHead className="whitespace-nowrap hidden lg:table-cell">
              Open
            </TableHead>
            <TableHead className="whitespace-nowrap hidden lg:table-cell">
              Close
            </TableHead>
            <TableHead className="whitespace-nowrap hidden lg:table-cell">
              Basis of Allotment Date
            </TableHead>
            <TableHead className="whitespace-nowrap hidden lg:table-cell">
              Listing
            </TableHead>
            <TableHead className="whitespace-nowrap hidden sm:table-cell">
              GMP Updated
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {gmpData.map((item) => (
            <TableRow key={item.ipo} className={item.classname}>
              <TableCell className="font-medium">{item.ipo}</TableCell>
              <TableCell className="hidden sm:table-cell">
                {item.price}
              </TableCell>
              <TableCell className="hidden sm:table-cell">{item.gmp}</TableCell>
              <TableCell className="hidden sm:table-cell">
                {item.est_listing}
              </TableCell>
              <TableCell className="hidden md:table-cell">
                {decodeHTML(item.ipo_size)}
              </TableCell>
              <TableCell className="hidden md:table-cell">{item.lot}</TableCell>
              <TableCell className="hidden lg:table-cell">
                {item.open}
              </TableCell>
              <TableCell className="hidden lg:table-cell">
                {item.close}
              </TableCell>
              <TableCell className="hidden lg:table-cell">
                {item.boa_dt}
              </TableCell>
              <TableCell className="hidden lg:table-cell">
                {item.listing}
              </TableCell>
              <TableCell className="hidden sm:table-cell">
                {item.gmp_updated}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={11} className="text-center">
              Data sourced from investorgain.com
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );

  return isMobile ? renderMobileView() : renderDesktopView();
}
