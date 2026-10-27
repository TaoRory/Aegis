import type { Metadata } from "next";
import type { ReactNode } from "react";

import { FactoryLayoutView, factoryMetadata, factoryStaticParams, type LayoutParams } from "@/components/space/views/layout";

export const generateStaticParams = factoryStaticParams;

export async function generateMetadata({ params }: { params: LayoutParams }): Promise<Metadata> {
  return factoryMetadata(params, "neutral");
}

export default function FactoryLayout({ children, params }: { children: ReactNode; params: LayoutParams }) {
  return (
    <FactoryLayoutView variant="neutral" params={params}>
      {children}
    </FactoryLayoutView>
  );
}
