import { Route, Routes } from "react-router-dom";
import StudioWorkspace from "./StudioWorkspace";
import { LandingPage } from "./components/public/LandingPage";
import {
  AboutSymbolsPage,
  KioskPage,
  ResourcesPage,
  SectorPage,
  TrustPage,
} from "./components/public/PublicPages";

export type { QuickCard, AppTab } from "./StudioWorkspace";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/about-symbols" element={<AboutSymbolsPage />} />
      <Route path="/sectors/adult-social-care" element={<SectorPage sectorKey="adult-social-care" />} />
      <Route path="/sectors/nhs-health" element={<SectorPage sectorKey="nhs-health" />} />
      <Route path="/sectors/send-education" element={<SectorPage sectorKey="send-education" />} />
      <Route path="/sectors/families-carers" element={<SectorPage sectorKey="families-carers" />} />
      <Route path="/resources" element={<ResourcesPage />} />
      <Route path="/trust" element={<TrustPage />} />
      <Route path="/kiosk" element={<KioskPage />} />
      <Route path="/studio" element={<StudioWorkspace />} />
      <Route path="*" element={<LandingPage />} />
    </Routes>
  );
}
