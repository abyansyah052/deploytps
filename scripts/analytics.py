import pandas as pd
import psycopg2
import numpy as np
from datetime import datetime
import json

class MaterialAnalytics:
    def __init__(self):
        self.conn = psycopg2.connect(
            host="localhost",
            database="tps_dashboard",
            user="tps_user",
            password="Abyansyah123"
        )
    
    def get_low_stock_analysis(self):
        """Analyze low stock materials with advanced metrics"""
        query = """
        SELECT 
            COALESCE(nama_material, 'CC/ME') as material_name,
            kode_material,
            kategori,
            original_qty,
            threshold_qty,
            (threshold_qty - original_qty) as shortage,
            CASE 
                WHEN original_qty = 0 THEN 'Critical'
                WHEN original_qty < threshold_qty * 0.3 THEN 'Urgent'
                WHEN original_qty < threshold_qty * 0.7 THEN 'Low'
                ELSE 'Normal'
            END as priority_level
        FROM materials 
        WHERE original_qty < threshold_qty
        ORDER BY (threshold_qty - original_qty) DESC
        """
        
        df = pd.read_sql_query(query, self.conn)
        
        # Add analytics
        df['shortage_percentage'] = ((df['threshold_qty'] - df['original_qty']) / df['threshold_qty'] * 100).round(2)
        
        return {
            'total_low_stock': len(df),
            'critical_items': len(df[df['priority_level'] == 'Critical']),
            'urgent_items': len(df[df['priority_level'] == 'Urgent']),
            'total_shortage_value': df['shortage'].sum(),
            'most_critical': df.head(10).to_dict('records')
        }
    
    def get_category_performance(self):
        """Analyze material categories performance"""
        query = """
        SELECT 
            kategori,
            COUNT(*) as total_materials,
            SUM(original_qty) as total_quantity,
            AVG(original_qty) as avg_quantity,
            COUNT(CASE WHEN original_qty < threshold_qty THEN 1 END) as low_stock_count,
            COUNT(CASE WHEN status = 'active' THEN 1 END) as active_materials
        FROM materials 
        WHERE kategori IS NOT NULL
        GROUP BY kategori
        ORDER BY total_materials DESC
        """
        
        df = pd.read_sql_query(query, self.conn)
        df['low_stock_percentage'] = (df['low_stock_count'] / df['total_materials'] * 100).round(2)
        df['active_percentage'] = (df['active_materials'] / df['total_materials'] * 100).round(2)
        
        return df.to_dict('records')
    
    def predict_stock_needs(self):
        """Simple stock prediction based on current usage patterns"""
        query = """
        SELECT 
            kategori,
            COUNT(*) as total_items,
            AVG(original_qty) as avg_stock,
            AVG(threshold_qty) as avg_threshold,
            STDDEV(original_qty) as stock_volatility
        FROM materials 
        WHERE kategori IS NOT NULL AND original_qty > 0
        GROUP BY kategori
        """
        
        df = pd.read_sql_query(query, self.conn)
        
        # Simple prediction: recommend 20% buffer above threshold
        df['recommended_stock'] = (df['avg_threshold'] * 1.2).round(0)
        df['reorder_point'] = (df['avg_threshold'] * 0.8).round(0)
        
        return df.to_dict('records')
    
    def generate_dashboard_insights(self):
        """Generate comprehensive insights for dashboard"""
        insights = {
            'timestamp': datetime.now().isoformat(),
            'low_stock_analysis': self.get_low_stock_analysis(),
            'category_performance': self.get_category_performance(),
            'stock_predictions': self.predict_stock_needs(),
            'summary': {
                'total_materials': self.get_total_materials(),
                'efficiency_score': self.calculate_efficiency_score(),
                'recommendations': self.generate_recommendations()
            }
        }
        
        return insights
    
    def get_total_materials(self):
        cursor = self.conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM materials")
        return cursor.fetchone()[0]
    
    def calculate_efficiency_score(self):
        """Calculate inventory efficiency score (0-100)"""
        cursor = self.conn.cursor()
        cursor.execute("""
            SELECT 
                COUNT(*) as total,
                COUNT(CASE WHEN original_qty >= threshold_qty THEN 1 END) as adequate_stock,
                COUNT(CASE WHEN status = 'active' THEN 1 END) as active_materials
            FROM materials
        """)
        
        total, adequate, active = cursor.fetchone()
        
        if total == 0:
            return 0
        
        stock_efficiency = (adequate / total) * 50  # 50% weight for stock adequacy
        active_efficiency = (active / total) * 50   # 50% weight for active materials
        
        return round(stock_efficiency + active_efficiency, 1)
    
    def generate_recommendations(self):
        """Generate actionable recommendations"""
        recommendations = []
        
        # Check critical stock items
        cursor = self.conn.cursor()
        cursor.execute("""
            SELECT COUNT(*) FROM materials 
            WHERE original_qty < threshold_qty * 0.3
        """)
        critical_count = cursor.fetchone()[0]
        
        if critical_count > 0:
            recommendations.append({
                'type': 'urgent',
                'message': f'You have {critical_count} materials with critically low stock. Immediate restocking required.',
                'action': 'Review and reorder critical items'
            })
        
        # Check inactive materials
        cursor.execute("""
            SELECT COUNT(*) FROM materials 
            WHERE status = 'inactive' AND original_qty > 0
        """)
        inactive_with_stock = cursor.fetchone()[0]
        
        if inactive_with_stock > 0:
            recommendations.append({
                'type': 'optimization',
                'message': f'{inactive_with_stock} inactive materials still have stock. Consider reactivating or redistributing.',
                'action': 'Review inactive material status'
            })
        
        return recommendations
    
    def close(self):
        self.conn.close()

# Usage example
if __name__ == "__main__":
    analytics = MaterialAnalytics()
    insights = analytics.generate_dashboard_insights()
    
    # Save insights to JSON file
    with open('material_insights.json', 'w') as f:
        json.dump(insights, f, indent=2, default=str)
    
    print("Analytics complete! Check material_insights.json for detailed insights.")
    analytics.close()
