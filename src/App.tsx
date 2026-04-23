import { Routes, Route } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import Dashboard from './pages/Dashboard';
import AdSlots from './pages/AdSlots';
import Campaigns from './pages/Campaigns';
import NewCampaign from './pages/NewCampaign';
import Theaters from './pages/Theaters';
import Screens from './pages/Screens';
import Movies from './pages/Movies';
import Reports from './pages/Reports';
import DSP from './pages/DSP';
import ImportSchedule from './pages/ImportSchedule';

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/theaters" element={<Theaters />} />
        <Route path="/screens" element={<Screens />} />
        <Route path="/movies" element={<Movies />} />
        <Route path="/ad-slots" element={<AdSlots />} />
        <Route path="/inventory/add" element={<Theaters />} />
        <Route path="/inventory/import" element={<ImportSchedule />} />
        <Route path="/campaigns" element={<Campaigns />} />
        <Route path="/campaigns/new" element={<NewCampaign />} />
        <Route path="/campaign-targeting" element={<NewCampaign />} />
        <Route path="/dsp" element={<DSP />} />
        <Route path="/reports" element={<Reports />} />
      </Route>
    </Routes>
  );
}
