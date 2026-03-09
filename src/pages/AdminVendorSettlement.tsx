import React from "react";
import { motion } from "framer-motion";
import { AdminLayout } from "@/components/AdminLayout";
import { supabase } from "@/lib/supabase";
import { Calendar, DollarSign, TrendingUp, Download, Filter, Building2, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

interface SettlementData {
  shop_id: string | null;
  shop_name: string;
  sku_prefix: string;
  commission_percent: number;
  total_sales: number;
  commission_due: number;
  net_payout: number;
  order_count: number;
  items_sold: number;
}

const AdminVendorSettlement: React.FC = () => {
  const [settlements, setSettlements] = React.useState<SettlementData[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [dateRange, setDateRange] = React.useState({
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  
  const [summary, setSummary] = React.useState({
    totalRevenue: 0,
    totalCommission: 0,
    totalPayout: 0,
    orderCount: 0
  });

  const fetchSettlements = async () => {
    setLoading(true);
    try {
      // Get delivered orders within date range with shop and item details
      const { data: orders, error } = await supabase
        .from('orders')
        .select(`
          id, total_amount, created_at, status,
          order_items!inner(
            product_title, quantity, unit_price, buying_cost, shop_id,
            shops(name, sku_prefix, commission_percent)
          )
        `)
        .eq('status', 'delivered')
        .gte('created_at', `${dateRange.start}T00:00:00`)
        .lte('created_at', `${dateRange.end}T23:59:59`);

      if (error) throw error;

      // Process settlements by shop
      const shopSettlements = new Map<string, SettlementData>();
      
      // Initialize "own" shop (HUKAM's direct sales)
      shopSettlements.set('own', {
        shop_id: null,
        shop_name: 'HUKAM Direct',
        sku_prefix: 'HUK',
        commission_percent: 0,
        total_sales: 0,
        commission_due: 0,
        net_payout: 0,
        order_count: 0,
        items_sold: 0
      });

      orders?.forEach(order => {
        order.order_items.forEach((item: any) => {
          const shopId = item.shop_id || 'own';
          const shop = item.shops;
          
          if (!shopSettlements.has(shopId)) {
            shopSettlements.set(shopId, {
              shop_id: shopId === 'own' ? null : shopId,
              shop_name: shop?.name || 'HUKAM Direct',
              sku_prefix: shop?.sku_prefix || 'HUK',
              commission_percent: shop?.commission_percent || 0,
              total_sales: 0,
              commission_due: 0,
              net_payout: 0,
              order_count: 0,
              items_sold: 0
            });
          }

          const settlement = shopSettlements.get(shopId)!;
          const itemRevenue = item.unit_price * item.quantity;
          const commission = (itemRevenue * settlement.commission_percent) / 100;
          
          settlement.total_sales += itemRevenue;
          settlement.commission_due += commission;
          settlement.net_payout = settlement.total_sales - settlement.commission_due;
          settlement.items_sold += item.quantity;
        });
      });

      // Count unique orders per shop
      const shopOrderCounts = new Map<string, Set<string>>();
      orders?.forEach(order => {
        order.order_items.forEach((item: any) => {
          const shopId = item.shop_id || 'own';
          if (!shopOrderCounts.has(shopId)) {
            shopOrderCounts.set(shopId, new Set());
          }
          shopOrderCounts.get(shopId)!.add(order.id);
        });
      });

      // Update order counts
      shopOrderCounts.forEach((orderIds, shopId) => {
        const settlement = shopSettlements.get(shopId);
        if (settlement) {
          settlement.order_count = orderIds.size;
        }
      });

      const settlementsArray = Array.from(shopSettlements.values())
        .filter(s => s.total_sales > 0)
        .sort((a, b) => b.total_sales - a.total_sales);

      setSettlements(settlementsArray);
      
      // Calculate summary
      const totalRevenue = settlementsArray.reduce((sum, s) => sum + s.total_sales, 0);
      const totalCommission = settlementsArray.reduce((sum, s) => sum + s.commission_due, 0);
      const totalPayout = settlementsArray.reduce((sum, s) => sum + s.net_payout, 0);
      const totalOrders = settlementsArray.reduce((sum, s) => sum + s.order_count, 0);
      
      setSummary({
        totalRevenue,
        totalCommission,
        totalPayout,
        orderCount: totalOrders
      });

    } catch (err: any) {
      console.error('Settlement calculation error:', err);
      toast({ 
        title: "Error", 
        description: err.message || "Failed to calculate settlements", 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (settlements.length === 0) {
      toast({ title: "No Data", description: "No settlement data to export" });
      return;
    }

    const csvHeaders = [
      'Shop Name',
      'Shop ID', 
      'SKU Prefix',
      'Commission %',
      'Total Sales (Rs.)',
      'Commission Due (Rs.)',
      'Net Payout (Rs.)',
      'Orders',
      'Items Sold'
    ];

    const csvRows = settlements.map(s => [
      s.shop_name,
      s.shop_id || 'HUKAM_DIRECT',
      s.sku_prefix,
      s.commission_percent,
      s.total_sales.toFixed(2),
      s.commission_due.toFixed(2),
      s.net_payout.toFixed(2),
      s.order_count,
      s.items_sold
    ]);

    // Add summary row
    csvRows.push([]);
    csvRows.push(['SUMMARY', '', '', '', 
      summary.totalRevenue.toFixed(2),
      summary.totalCommission.toFixed(2), 
      summary.totalPayout.toFixed(2),
      summary.orderCount,
      ''
    ]);

    const csvContent = [csvHeaders, ...csvRows]
      .map(row => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `vendor-settlements-${dateRange.start}-to-${dateRange.end}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({ title: "Exported", description: "Settlement data exported successfully" });
  };

  React.useEffect(() => {
    fetchSettlements();
  }, []);

  return (
    <AdminLayout activeTab="settlements">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Vendor Settlements</h1>
            <p className="text-sm text-muted-foreground">
              Calculate commission and payouts for delivered orders
            </p>
          </div>
          <Button onClick={exportToCSV} disabled={settlements.length === 0} className="gap-2">
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
        </div>

        {/* Date Range Filter */}
        <div className="glass-card p-6 rounded-xl">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Date Range:</span>
            </div>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="px-3 py-1.5 border border-border rounded-lg text-sm bg-background text-foreground"
            />
            <span className="text-muted-foreground">to</span>
            <input
              type="date" 
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="px-3 py-1.5 border border-border rounded-lg text-sm bg-background text-foreground"
            />
            <Button onClick={fetchSettlements} disabled={loading} className="gap-2">
              <Filter className="w-4 h-4" />
              {loading ? "Calculating..." : "Calculate"}
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        {settlements.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Revenue</p>
                  <p className="text-2xl font-bold text-foreground">Rs.{summary.totalRevenue.toLocaleString()}</p>
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-destructive/10 rounded-lg">
                  <DollarSign className="w-5 h-5 text-destructive" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Commission</p>
                  <p className="text-2xl font-bold text-foreground">Rs.{summary.totalCommission.toLocaleString()}</p>
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Building2 className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Net Payout</p>
                  <p className="text-2xl font-bold text-primary">Rs.{summary.totalPayout.toLocaleString()}</p>
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-6 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-secondary rounded-lg">
                  <Package className="w-5 h-5 text-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Orders</p>
                  <p className="text-2xl font-bold text-foreground">{summary.orderCount}</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Settlements Table */}
        <div className="glass-card rounded-xl overflow-hidden">
          <div className="p-6 border-b border-border/40">
            <h2 className="text-lg font-semibold text-foreground">Settlement Breakdown</h2>
            <p className="text-sm text-muted-foreground">Commission and payout details by vendor</p>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-pulse">Calculating settlements...</div>
            </div>
          ) : settlements.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              No delivered orders found in the selected date range
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-secondary/20">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Shop</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Commission %</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Sales</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Commission</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Net Payout</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Orders</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Items</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {settlements.map((settlement, i) => (
                    <motion.tr 
                      key={settlement.shop_id || 'own'}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="hover:bg-secondary/10 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Building2 className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{settlement.shop_name}</p>
                            <p className="text-xs text-muted-foreground">{settlement.sku_prefix}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-left">
                        <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold bg-secondary text-foreground">
                          {settlement.commission_percent}%
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-foreground">
                        Rs.{settlement.total_sales.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-destructive">
                        Rs.{settlement.commission_due.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-primary">
                        Rs.{settlement.net_payout.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right text-muted-foreground">
                        {settlement.order_count}
                      </td>
                      <td className="px-6 py-4 text-right text-muted-foreground">
                        {settlement.items_sold}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminVendorSettlement;