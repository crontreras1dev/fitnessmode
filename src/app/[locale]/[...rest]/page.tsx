import { notFound } from "next/navigation";

/** Catches every unmatched path inside a locale so it renders the localized 404. */
export default function CatchAllPage() {
  notFound();
}
