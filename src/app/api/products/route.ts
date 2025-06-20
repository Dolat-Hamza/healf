import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { parseCSVToProducts } from '@/lib/csv-parser';

export async function GET() {
  try {
    const csvPath = path.join(process.cwd(), 'src/data/sample-products.csv');
    const csvContent = await fs.readFile(csvPath, 'utf-8');
    const products = parseCSVToProducts(csvContent);
    
    return NextResponse.json({
      products,
      total: products.length,
      success: true
    });
  } catch (error) {
    console.error('Error loading products:', error);
    return NextResponse.json(
      { error: 'Failed to load products', success: false },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('csv') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No CSV file provided', success: false },
        { status: 400 }
      );
    }
    
    const csvContent = await file.text();
    const products = parseCSVToProducts(csvContent);
    
    return NextResponse.json({
      products,
      total: products.length,
      success: true
    });
  } catch (error) {
    console.error('Error parsing uploaded CSV:', error);
    return NextResponse.json(
      { error: 'Failed to parse CSV file', success: false },
      { status: 500 }
    );
  }
}
