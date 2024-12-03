// app/(default)/garden/page.tsx

import { Metadata } from 'next';
import GardenHeader from './garden-header';
import GardenAreaList from './garden-area-list';
import { GardenAreaWithDetails } from '@/types/garden';
import supabaseAdmin from '@/lib/supabaseAdmin';

export const metadata: Metadata = {
  title: 'Garden - Co-op Management',
  description: 'Manage garden areas, tasks, and plants',
};

// Force dynamic rendering to ensure fresh data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getGardenAreas() {
  try {
    const { data: areas, error } = await supabaseAdmin
      .from('garden_areas')
      .select(
        `
        *,
        tasks:garden_tasks(
          *,
          comments:garden_comments(*)
        ),
        plants:garden_plants(*)
      `
      )
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching garden areas:', error);
      return [];
    }

    return areas as GardenAreaWithDetails[];
  } catch (err) {
    console.error('Error fetching garden areas:', err);
    return [];
  }
}

export default async function GardenPage() {
  const areas = await getGardenAreas();

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
      <GardenHeader />
      <GardenAreaList areas={areas} />
    </div>
  );
}
