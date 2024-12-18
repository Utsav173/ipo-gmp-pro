import { decodeHTML, getSubscriptionColor } from "@/lib/utils";
import { Badge } from "../ui/badge";

const IPOText = ({ ipoString }: { ipoString: string }) => {
  // Try to extract components with optional status and subscription
  const subMatch = ipoString.match(/\(Sub:(\d+\.?\d*x)\)/);
  const statusMatch = ipoString.match(/\s+(Open|Close)\s*/);

  const subscriptionCount = subMatch ? subMatch[1] : null;
  const status = statusMatch ? statusMatch[1] : null;

  // Get the base name by removing status and subscription if they exist
  let baseName = ipoString
    .replace(/\s+(Open|Close)\s*/, "") // Remove status if exists
    .replace(/\s*\(Sub:\d+\.?\d*x\)/, ""); // Remove subscription if exists

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center gap-2">
        <span className="font-medium truncate">{decodeHTML(baseName)}</span>
        {status && (
          <Badge
            variant={
              status.toLowerCase() === "open" ? "success" : "destructive"
            }
            className="text-xs whitespace-nowrap px-1 py-0 mx-2"
          >
            {status}
          </Badge>
        )}
      </div>
      {subscriptionCount && (
        <div
          className={`text-sm ${getSubscriptionColor(
            subscriptionCount
          )} font-medium`}
        >
          Sub: {subscriptionCount}
        </div>
      )}
    </div>
  );
};

export default IPOText;
