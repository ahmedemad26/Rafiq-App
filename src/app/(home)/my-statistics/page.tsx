import type { Metadata } from "next";
import MyStatisticsPageClient from "./_components/my-statistics-page-client";

export const metadata: Metadata = {
  title: "My Statistics",
  description: "Task insights for your selected date range.",
};

export default function MyStatisticsPage() {
  return <MyStatisticsPageClient />;
}
