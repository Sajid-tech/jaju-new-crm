import {   Route, Routes } from "react-router-dom";



import AuthRoute from "./AuthRoute";
import Login from "@/app/auth/Login";
import ForgotPassword from "@/components/ForgotPassword/ForgotPassword";
import Maintenance from "@/components/common/Maintenance";
import ProtectedRoute from "./ProtectedRoute";

import NotFound from "@/app/errors/NotFound";
import Home from "@/app/home/Home";
import EstimateList from "@/app/estimate/EstimateList";
import DayBookReport from "@/app/dayBook/DayBookReport";
import StocksReport from "@/app/stocks/StocksReport";
import SalesList from "@/app/sales/SalesList";
import PurchaseGraniteList from "@/app/purchaseGranite/PurchaseGraniteList";
import PurchaseTilesList from "@/app/purchaseTiles/PurchaseTilesList";
import ProductList from "@/app/product/ProductList";
import TrialBalanceReport from "@/app/trialBalance/TrialBalanceReport";
import LedgerReport from "@/app/ledger/LedgerReport";
import EstimateView from "@/app/estimate/EstimateView";
import PurchaseGraniteView from "@/app/purchaseGranite/PurchaseGraniteView";
import PurchaseTilesView from "@/app/purchaseTiles/PurchaseTilesView";
import SalesView from "@/app/sales/SalesView";

function AppRoutes() {
  return (

      <Routes>
        <Route path="/" element={<AuthRoute />}>
          <Route path="/" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/maintenance" element={<Maintenance />} />
        </Route>

        <Route path="/" element={<ProtectedRoute />}>
          <Route path="/home" element={<Home />} />
          <Route path="/estimate" element={<EstimateList />} />
          <Route path="/estimate/view/:id" element={<EstimateView />} />
          <Route path="/day-book" element={<DayBookReport />} />
          <Route path="/ledger" element={<LedgerReport />} />
          <Route path="/trial-balance" element={<TrialBalanceReport />} />
          <Route path="/product" element={<ProductList />} />
          <Route path="/purchase-granite" element={<PurchaseGraniteList />} />
          <Route path="/purchase-granite/view/:id" element={<PurchaseGraniteView />} />
          <Route path="/purchase-tiles" element={<PurchaseTilesList />} />
          <Route path="/purchase-tiles/view/:id" element={<PurchaseTilesView />} />
          <Route path="/sales" element={<SalesList />} />
          <Route path="/sales/view/:id" element={<SalesView />} />
          <Route path="/stocks" element={<StocksReport />} />
         
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    
  );
}

export default AppRoutes;