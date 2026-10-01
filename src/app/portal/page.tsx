import { requireStaff } from "@/lib/portal/guard";
import OwnerDashboard from "@/components/portal/OwnerDashboard";
import AssistantDesk from "@/components/portal/AssistantDesk";

export const metadata = { title: "Dashboard" };

/**
 * One route, two entirely different products.
 *
 * The chef and his assistant do not need the same screen with some parts hidden;
 * they need different screens. He needs to know the state of the business and
 * what will break. She needs to know what to do next and in what order. Giving
 * them the same dashboard with a few boxes removed would serve neither.
 */
export default async function PortalHome() {
  const session = await requireStaff();
  return session.role === "owner" ? (
    <OwnerDashboard session={session} />
  ) : (
    <AssistantDesk session={session} />
  );
}
