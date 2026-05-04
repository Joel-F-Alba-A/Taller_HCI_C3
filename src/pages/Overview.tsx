import { useMemo } from 'react';
import { useData } from '../store/DataContext';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area 
} from 'recharts';

export default function Overview() {
  const { purchases, clients } = useData();

  const totalSales = purchases.reduce((acc, curr) => acc + curr.cost, 0);
  
  // Aggregate sales by month
  const salesByMonth = useMemo(() => {
    const map: Record<string, number> = {};
    purchases.forEach(p => {
      const monthStr = p.date.substring(0, 7); // YYYY-MM
      map[monthStr] = (map[monthStr] || 0) + p.cost;
    });
    return Object.keys(map).map(k => ({ month: k, ventas: map[k] })).sort((a,b) => a.month.localeCompare(b.month));
  }, [purchases]);

  // Types of lenses pie chart
  const lensDistribution = useMemo(() => {
    const map: Record<string, number> = {};
    purchases.forEach(p => {
      map[p.lensType] = (map[p.lensType] || 0) + 1;
    });
    return Object.keys(map).map(k => ({ name: k, value: map[k] }));
  }, [purchases]);

  // Types of products/frames bar chart
  const productDistribution = useMemo(() => {
    const map: Record<string, number> = {};
    purchases.forEach(p => {
      map[p.product] = (map[p.product] || 0) + 1;
    });
    return Object.keys(map).map(k => ({ name: k, unidades: map[k] })).sort((a,b) => b.unidades - a.unidades);
  }, [purchases]);

  // Client Categories Pie Chart
  const clientCategories = useMemo(() => {
    const map: Record<string, number> = { VIP: 0, Fiel: 0, Normal: 0};
    clients.forEach(c => map[c.type] += 1);
    return [
      {name: 'VIP', value: map.VIP},
      {name: 'Fiel', value: map.Fiel},
      {name: 'Normal', value: map.Normal}
    ];
  }, [clients]);

  const COLORS = ['#004182', '#0056B3', '#1E88E5', '#42A5F5', '#90CAF9', '#BBDEFB'];
  const CLIENT_COLORS = ['#004182', '#4299E1', '#A3CFFF'];

  const customPieLabel = (props: any) => {
    const { x, y, name, percent, textAnchor } = props;
    return (
      <text x={x} y={y} fill="var(--opt-text)" fontWeight={700} fontSize={13} textAnchor={textAnchor}>
        {`${name}: ${((percent || 0) * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div>
      <h1 style={{ marginBottom: 20, color: 'var(--opt-blue)', fontWeight: 'bold' }}>Dashboard Gerencial Interactivo</h1>
      
      <div className="grid-4">
        <div className="stat-card">
          <h3>Ingresos Totales (Histórico)</h3>
          <div className="value">${totalSales.toLocaleString()}</div>
        </div>
        <div className="stat-card">
          <h3>Total Clientes Base</h3>
          <div className="value">{clients.length}</div>
        </div>
        <div className="stat-card">
          <h3>Tickets Promedio</h3>
          <div className="value">${Math.round(totalSales / (purchases.length || 1)).toLocaleString()}</div>
        </div>
        <div className="stat-card">
          <h3>Clientes VIP (%)</h3>
          <div className="value">{Math.round((clients.filter(c => c.type === 'VIP').length / clients.length) * 100) || 0}%</div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <h2>Crecimiento de Ingresos por Mes</h2>
          <div style={{ height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesByMonth}>
                <defs>
                  <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--opt-blue)" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="var(--opt-blue)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                <XAxis dataKey="month" stroke="var(--opt-text-muted)" tick={{ fill: 'var(--opt-text-muted)', fontWeight: 600 }} />
                <YAxis stroke="var(--opt-text-muted)" tickFormatter={(val) => `$${(val / 1000000).toFixed(1)}M`} width={80} tick={{ fill: 'var(--opt-text-muted)', fontWeight: 600 }} />
                <RechartsTooltip contentStyle={{ backgroundColor: 'var(--bg-color)', color: 'var(--text-color)', border: '1px solid var(--border-color)', fontWeight: 'bold' }} formatter={(value: any) => `$${Number(value).toLocaleString()}`} />
                <Area type="monotone" dataKey="ventas" stroke="var(--opt-blue)" strokeWidth={3} fillOpacity={1} fill="url(#colorVentas)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h2>Top Monturas Más Vendidas</h2>
          <div style={{ height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={productDistribution} layout="vertical" margin={{ left: 50 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border-color)" />
                <XAxis type="number" stroke="var(--opt-text-muted)" tick={{ fill: 'var(--opt-text-muted)', fontWeight: 600 }} />
                <YAxis dataKey="name" type="category" width={140} stroke="var(--opt-text-muted)" tick={{ fill: 'var(--opt-text-muted)', fontSize: 13, fontWeight: 600 }} />
                <RechartsTooltip cursor={{fill: 'var(--border-color)'}} contentStyle={{ backgroundColor: 'var(--bg-color)', color: 'var(--text-color)', border: '1px solid var(--border-color)', fontWeight: 'bold' }} />
                <Bar dataKey="unidades" fill="#004182" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h2>Distribución por Tipo de Lente</h2>
          <div style={{ height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={lensDistribution}
                  innerRadius={70}
                  outerRadius={110}
                  paddingAngle={3}
                  dataKey="value"
                  label={customPieLabel}
                  labelLine={{ stroke: 'var(--opt-text)', strokeWidth: 1.5 }}
                  stroke="var(--bg-color)"
                >
                  {lensDistribution.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip contentStyle={{ backgroundColor: 'var(--bg-color)', color: 'var(--text-color)', border: '1px solid var(--border-color)', fontWeight: 'bold' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h2>Segmentación de Clientes CRM</h2>
          <div style={{ height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={clientCategories}
                  outerRadius={110}
                  dataKey="value"
                  stroke="var(--bg-color)"
                  label={customPieLabel}
                  labelLine={{ stroke: 'var(--opt-text)', strokeWidth: 1.5 }}
                >
                  {clientCategories.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={CLIENT_COLORS[index % CLIENT_COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip contentStyle={{ backgroundColor: 'var(--bg-color)', color: 'var(--text-color)', border: '1px solid var(--border-color)', fontWeight: 'bold' }} />
                <Legend wrapperStyle={{ fontWeight: 600, color: 'var(--opt-text)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
