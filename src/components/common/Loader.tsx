import { Card, CardContent, CardHeader } from "../ui/card";
import { Skeleton } from "../ui/skeleton";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

const Loader = ({ isMobile }: { isMobile: boolean }) => {
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
        {isMobile ? (
          <Skeleton className="h-8 w-full" />
        ) : (
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
        )}
      </Card>
    </div>
  );
};

export default Loader;
