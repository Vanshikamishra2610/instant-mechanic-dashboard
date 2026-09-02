import { Topbar } from "@/components/Topbar";
import { BookingsTable } from "@/components/BookingsTable";

export default function BookingsPage() {
  return (
    <>
      <Topbar title="Bookings" subtitle="Search, filter and track every service booking" />
      <main className="flex-1 px-6 py-6 md:px-8">
        <BookingsTable />
      </main>
    </>
  );
}
