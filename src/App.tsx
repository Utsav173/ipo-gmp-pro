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

export default function App() {
  const [gmpData, setGmpData] = useState<GmpDataItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null); // Type error as string or null

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
        // Check if 'err' is an instance of Error and has a message property
        if (err instanceof Error) {
          setError(err.message);
        } else {
          // Handle cases where the error is not an Error object or lacks a message
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

  return (
    <div className="w-full overflow-x-auto">
      {" "}
      {/* Add this for horizontal scrolling */}
      <Table>
        <TableCaption>Live IPO GMP (Grey Market Premium) Data</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="whitespace-nowrap">IPO</TableHead>{" "}
            {/* Prevent wrapping */}
            <TableHead className="whitespace-nowrap hidden sm:table-cell">
              Price
            </TableHead>{" "}
            {/* Hide on small screens */}
            <TableHead className="whitespace-nowrap hidden sm:table-cell">
              GMP
            </TableHead>
            <TableHead className="whitespace-nowrap hidden sm:table-cell">
              Est. Listing
            </TableHead>
            <TableHead className="whitespace-nowrap hidden md:table-cell">
              IPO Size
            </TableHead>{" "}
            {/* Hide on medium and smaller screens */}
            <TableHead className="whitespace-nowrap hidden md:table-cell">
              Lot
            </TableHead>
            <TableHead className="whitespace-nowrap hidden lg:table-cell">
              Open
            </TableHead>{" "}
            {/* Hide on large and smaller screens */}
            <TableHead className="whitespace-nowrap hidden lg:table-cell">
              Close
            </TableHead>
            <TableHead className="whitespace-nowrap hidden lg:table-cell">
              BOA Date
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
                {item.ipo_size}
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
}
