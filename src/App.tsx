import { useState, useEffect } from 'react';
import { Settings, Package, Shield, RefreshCw } from 'lucide-react';

const GATEWAY_URL = 'http://localhost:4000/graphql';

export default function App() {
  const [activeEngine, setActiveEngine] = useState('mock');
  const [medusaUrl, setMedusaUrl] = useState('http://localhost:9000');
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [successMsg, setSuccessMsg] = useState('');

  // Fetch current config and products from GraphQL Gateway
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch(GATEWAY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `
            query GetConfigAndProducts {
              config {
                activeEngine
                medusaUrl
              }
              products {
                id
                title
                description
                price
                currency
              }
            }
          `
        })
      });
      const { data } = await response.json();
      if (data?.config) {
        setActiveEngine(data.config.activeEngine);
        setMedusaUrl(data.config.medusaUrl);
      }
      if (data?.products) {
        setProducts(data.products);
      }
    } catch (err) {
      console.error('Error fetching data from Gateway:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveConfig = async () => {
    setLoading(true);
    setSuccessMsg('');
    try {
      const response = await fetch(GATEWAY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `
            mutation UpdateConfig($activeEngine: String!, $medusaUrl: String!) {
              updateConfig(activeEngine: $activeEngine, medusaUrl: $medusaUrl) {
                activeEngine
                medusaUrl
              }
            }
          `,
          variables: { activeEngine, medusaUrl }
        })
      });
      const { data } = await response.json();
      if (data?.updateConfig) {
        setSuccessMsg('Configuración guardada exitosamente.');
        fetchData();
      }
    } catch (err) {
      console.error('Error updating config:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.logo}>
            <Shield style={{ marginRight: '8px' }} />
            <span>Admin Gateway E-commerce</span>
          </div>
          <button onClick={fetchData} style={styles.refreshBtn} disabled={loading}>
            <RefreshCw size={16} />
            <span style={{ marginLeft: '6px' }}>Actualizar</span>
          </button>
        </div>
      </header>

      {/* Main Grid */}
      <main style={styles.mainGrid}>
        {/* Left Column: Config */}
        <section style={styles.card}>
          <div style={styles.cardHeader}>
            <Settings style={{ marginRight: '8px' }} size={20} />
            <h2 style={styles.cardTitle}>Configuración del API Gateway</h2>
          </div>
          
          <div style={styles.formGroup}>
            <label style={styles.label}>Motor de E-commerce Activo</label>
            <select 
              value={activeEngine} 
              onChange={(e) => setActiveEngine(e.target.value)}
              style={styles.select}
            >
              <option value="mock">Modo Mock / Datos de Prueba</option>
              <option value="medusa">MedusaJS (Open Source Headless)</option>
              <option value="shopify">Shopify (SaaS Integración)</option>
              <option value="prestashop">PrestaShop (Open Source)</option>
            </select>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>URL del Motor Activo</label>
            <input 
              type="text" 
              value={medusaUrl} 
              onChange={(e) => setMedusaUrl(e.target.value)}
              style={styles.input}
              placeholder="http://localhost:9000"
            />
          </div>

          <button onClick={handleSaveConfig} style={styles.saveBtn} disabled={loading}>
            {loading ? 'Guardando...' : 'Aplicar Cambios sin Reiniciar'}
          </button>

          {successMsg && <p style={styles.success}>{successMsg}</p>}
        </section>

        {/* Right Column: Catalog Preview */}
        <section style={styles.card}>
          <div style={styles.cardHeader}>
            <Package style={{ marginRight: '8px' }} size={20} />
            <h2 style={styles.cardTitle}>Vista Previa del Catálogo (GraphQL)</h2>
          </div>
          <p style={styles.subtitle}>
            Productos actualmente resueltos por el API Gateway (Motor actual: <strong>{activeEngine.toUpperCase()}</strong>):
          </p>

          <div style={styles.productList}>
            {products.length === 0 ? (
              <p style={styles.empty}>No hay productos cargados o no se pudo conectar con el Gateway.</p>
            ) : (
              products.map((p) => (
                <div key={p.id} style={styles.productItem}>
                  <div>
                    <h3 style={styles.productTitle}>{p.title}</h3>
                    <p style={styles.productDesc}>{p.description}</p>
                  </div>
                  <span style={styles.productPrice}>
                    {p.price.toLocaleString('en-US', { style: 'currency', currency: p.currency })}
                  </span>
                </div>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

const styles = {
  container: {
    fontFamily: 'Inter, system-ui, sans-serif',
    minHeight: '100vh',
    backgroundColor: '#09090b',
    color: '#fafafa',
  },
  header: {
    borderBottom: '1px solid #27272a',
    padding: '16px 24px',
    backgroundColor: '#09090b',
  },
  headerContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '18px',
    fontWeight: 'bold',
  },
  refreshBtn: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#27272a',
    color: '#fafafa',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '9999px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'background-color 0.2s',
  },
  mainGrid: {
    maxWidth: '1200px',
    margin: '40px auto',
    padding: '0 24px',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
    gap: '24px',
  },
  card: {
    backgroundColor: '#18181b',
    borderRadius: '24px',
    padding: '32px',
    border: '1px solid #27272a',
    height: 'fit-content',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '24px',
  },
  cardTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    margin: 0,
  },
  subtitle: {
    fontSize: '14px',
    color: '#a1a1aa',
    marginBottom: '20px',
  },
  formGroup: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    fontSize: '12px',
    fontWeight: 'bold',
    color: '#a1a1aa',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    marginBottom: '8px',
  },
  select: {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '12px',
    backgroundColor: '#09090b',
    border: '1px solid #27272a',
    color: '#fafafa',
    fontSize: '14px',
    cursor: 'pointer',
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '12px',
    backgroundColor: '#09090b',
    border: '1px solid #27272a',
    color: '#fafafa',
    fontSize: '14px',
    boxSizing: 'border-box' as const,
  },
  saveBtn: {
    width: '100%',
    padding: '14px',
    borderRadius: '9999px',
    backgroundColor: '#fafafa',
    color: '#09090b',
    border: 'none',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '10px',
  },
  success: {
    fontSize: '14px',
    color: '#10b981',
    marginTop: '16px',
    textAlign: 'center' as const,
  },
  productList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '16px',
  },
  productItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px',
    borderRadius: '16px',
    border: '1px solid #27272a',
    backgroundColor: '#09090b',
  },
  productTitle: {
    fontSize: '14px',
    fontWeight: 'bold',
    margin: '0 0 4px 0',
  },
  productDesc: {
    fontSize: '12px',
    color: '#a1a1aa',
    margin: 0,
  },
  productPrice: {
    fontSize: '14px',
    fontWeight: 'bold',
  },
  empty: {
    fontSize: '14px',
    color: '#71717a',
    textAlign: 'center' as const,
    padding: '40px 0',
  }
};
