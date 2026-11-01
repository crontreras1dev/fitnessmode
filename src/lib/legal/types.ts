import type { ReactNode } from "react";

export type LegalSection = {
  id: string;
  title: string;
  body: ReactNode;
};

export type LegalDocument = {
  intro?: ReactNode;
  sections: LegalSection[];
};
