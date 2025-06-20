import csv
import random
from datetime import datetime, timedelta
import json

base_row = {
    '_AIRBYTE_RAW_ID': '467b2995-7399-4542-8ea2-632aea4971e6',
    '_AIRBYTE_EXTRACTED_AT': '2025-03-21 14:13:50.247 Z',
    '_AIRBYTE_META': '{"changes": [], "sync_id": 31326694}',
    '_AIRBYTE_GENERATION_ID': '0',
    'ID': '8.12162E+12',
    'SEO': '{"description": null, "title": "Product Title"}',
    'TAGS': 'Health, Supplements, Organic',
    'IMAGE': '',
    'TITLE': 'Sample Product',
    'HANDLE': 'sample-product',
    'IMAGES': '[]',
    'STATUS': 'ACTIVE',
    'VENDOR': 'Sample Vendor',
    'OPTIONS': '[{"id": 10349395476719, "name": "Title", "position": 1, "product_id": 8121622593775, "values": ["Default Title"]}]',
    'FEEDBACK': '',
    'SHOP_URL': 'how2go',
    'VARIANTS': '[{"id": 44084832108783}]',
    'BODY_HTML': '<p>Product description here</p>',
    'CREATED_AT': '2023-09-25 15:52:45.000 Z',
    'DELETED_AT': '',
    'UPDATED_AT': '2025-03-21 13:10:43.000 Z',
    'DESCRIPTION': 'Product description',
    'MEDIA_COUNT': '1',
    'IS_GIFT_CARD': 'FALSE',
    'PRODUCT_TYPE': 'Supplements',
    'PUBLISHED_AT': '2023-09-25 15:52:45.000 Z',
    'FEATURED_IMAGE': '',
    'FEATURED_MEDIA': '',
    'PRICE_RANGE_V2': '{"max_variant_price": {"amount": 29.99, "currency_code": "USD"}, "min_variant_price": {"amount": 19.99, "currency_code": "USD"}}',
    'TOTAL_VARIANTS': '1',
    'DELETED_MESSAGE': '',
    'PUBLISHED_SCOPE': '',
    'TEMPLATE_SUFFIX': '',
    'TOTAL_INVENTORY': '100',
    'DESCRIPTION_HTML': '<p>Product description here</p>',
    'ONLINE_STORE_URL': '',
    'TRACKS_INVENTORY': 'TRUE',
    'LEGACY_RESOURCE_ID': '8.12162E+12',
    'DELETED_DESCRIPTION': '',
    'ADMIN_GRAPHQL_API_ID': 'gid://shopify/Product/8121622593775',
    'REQUIRES_SELLIN_PLAN': '',
    'HAS_ONLY_DEFAULT_VARIANT': 'TRUE',
    'ONLINE_STORE_PREVIEW_URL': 'https://example.com/products/preview',
    'HAS_OUT_OF_STOCK_VARIANTS': 'FALSE',
    'PRICE_RANGE': '{"max_variant_price": {"amount": 29.99, "currency_code": "USD"}, "min_variant_price": {"amount": 19.99, "currency_code": "USD"}}',
    'METAFIELDS': '{"health_benefits": {"namespace": "health", "value": "general_wellness"}, "reviews_rating": {"namespace": "reviews", "value": "4.2"}, "reviews_count": {"namespace": "reviews", "value": "150"}}'
}

products = [
    {'TITLE': 'Vitamin D3 5000 IU', 'VENDOR': 'NatureWise', 'PRODUCT_TYPE': 'Vitamins', 'TAGS': 'Health, Vitamins, Immune Support'},
    {'TITLE': 'Organic Green Tea Extract', 'VENDOR': 'Garden of Life', 'PRODUCT_TYPE': 'Supplements', 'TAGS': 'Organic, Antioxidants, Weight Loss'},
    {'TITLE': 'Omega-3 Fish Oil', 'VENDOR': 'Nordic Naturals', 'PRODUCT_TYPE': 'Fish Oil', 'TAGS': 'Heart Health, Brain Health, Omega-3'},
    {'TITLE': 'Probiotics 50 Billion CFU', 'VENDOR': 'Renew Life', 'PRODUCT_TYPE': 'Probiotics', 'TAGS': 'Digestive Health, Gut Health, Probiotics'},
    {'TITLE': 'Magnesium Glycinate', 'VENDOR': 'Thorne', 'PRODUCT_TYPE': 'Minerals', 'TAGS': 'Sleep Support, Muscle Health, Magnesium'},
    {'TITLE': 'Turmeric Curcumin', 'VENDOR': 'Life Extension', 'PRODUCT_TYPE': 'Herbs', 'TAGS': 'Anti-inflammatory, Joint Health, Turmeric'},
    {'TITLE': 'B-Complex Vitamins', 'VENDOR': 'Jarrow Formulas', 'PRODUCT_TYPE': 'Vitamins', 'TAGS': 'Energy Support, B Vitamins, Metabolism'},
    {'TITLE': 'Ashwagandha Root Extract', 'VENDOR': 'Gaia Herbs', 'PRODUCT_TYPE': 'Herbs', 'TAGS': 'Stress Relief, Adaptogen, Ashwagandha'},
    {'TITLE': 'Collagen Peptides', 'VENDOR': 'Vital Proteins', 'PRODUCT_TYPE': 'Protein', 'TAGS': 'Skin Health, Joint Health, Collagen'},
    {'TITLE': 'Zinc Picolinate', 'VENDOR': 'NOW Foods', 'PRODUCT_TYPE': 'Minerals', 'TAGS': 'Immune Support, Zinc, Mineral'}
]

with open('../src/data/performance-test.csv', 'w', newline='', encoding='utf-8') as csvfile:
    fieldnames = list(base_row.keys())
    writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
    
    writer.writeheader()
    
    for i in range(2000):
        row = base_row.copy()
        product = products[i % len(products)]
        
        row['_AIRBYTE_RAW_ID'] = f'{random.randint(100000000, 999999999)}-{random.randint(1000, 9999)}-{random.randint(1000, 9999)}-{random.randint(1000, 9999)}-{random.randint(100000000000, 999999999999)}'
        row['ID'] = str(random.randint(8000000000000, 9000000000000))
        row['TITLE'] = f'{product["TITLE"]} - Variant {i+1}'
        row['VENDOR'] = product['VENDOR']
        row['PRODUCT_TYPE'] = product['PRODUCT_TYPE']
        row['TAGS'] = product['TAGS']
        row['HANDLE'] = f'{product["TITLE"].lower().replace(" ", "-")}-{i+1}'
        row['TOTAL_INVENTORY'] = str(random.randint(0, 500))
        
        min_price = random.randint(10, 50)
        max_price = min_price + random.randint(5, 30)
        price_data = {
            "max_variant_price": {"amount": f"{max_price}.99", "currency_code": "USD"},
            "min_variant_price": {"amount": f"{min_price}.99", "currency_code": "USD"}
        }
        row['PRICE_RANGE_V2'] = json.dumps(price_data)
        row['PRICE_RANGE'] = json.dumps(price_data)
        
        created_date = datetime.now() - timedelta(days=random.randint(1, 365))
        updated_date = created_date + timedelta(days=random.randint(0, 30))
        row['CREATED_AT'] = created_date.strftime('%Y-%m-%d %H:%M:%S.000 Z')
        row['UPDATED_AT'] = updated_date.strftime('%Y-%m-%d %H:%M:%S.000 Z')
        row['PUBLISHED_AT'] = created_date.strftime('%Y-%m-%d %H:%M:%S.000 Z')
        
        row['STATUS'] = random.choice(['ACTIVE', 'DRAFT', 'ARCHIVED'])
        
        metafields = {
            "health_benefits": {"namespace": "health", "value": random.choice(["immune_support", "energy_boost", "digestive_health", "joint_support"])},
            "reviews_rating": {"namespace": "reviews", "value": str(round(random.uniform(3.0, 5.0), 1))},
            "reviews_count": {"namespace": "reviews", "value": str(random.randint(10, 1000))},
            "inventory_location": {"namespace": "inventory", "value": random.choice(["warehouse_a", "warehouse_b", "warehouse_c"])},
            "shipping_weight": {"namespace": "shipping", "value": str(round(random.uniform(0.1, 2.0), 2))}
        }
        row['METAFIELDS'] = json.dumps(metafields)
        
        writer.writerow(row)

print('Generated performance-test.csv with 2000 rows')
