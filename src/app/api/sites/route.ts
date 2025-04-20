import { NextRequest, NextResponse } from 'next/server';
import { getAllSites, saveAllSites } from '@/lib/data-access/sites';
import { Site } from '@/types';
import { randomUUID } from 'crypto';
import { writeFile, mkdir } from 'fs/promises'; // Import fs/promises for async file operations
import path from 'path'; // Import path for handling file paths

// GET /api/sites
export async function GET() {
  try {
    const sites = await getAllSites();
    return NextResponse.json(sites);
  } catch (error) {
    console.error('API GET /api/sites Error:', error);
    return NextResponse.json({ message: 'Failed to fetch sites' }, { status: 500 });
  }
}

// POST /api/sites
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const name = formData.get('name') as string | null;
    const link = formData.get('link') as string | null;
    const description = formData.get('description') as string | null;
    const thumbnailFile = formData.get('thumbnail') as File | null;

    // Basic validation for text fields
    if (!name || !link || !description) {
      return NextResponse.json({ message: 'Missing required fields: name, link, description' }, { status: 400 });
    }

    let thumbnailUrl: string | undefined = undefined;

    if (thumbnailFile) {
      // Define the target directory
      const uploadDir = path.join(process.cwd(), 'public', 'images');
      // Ensure the directory exists
      await mkdir(uploadDir, { recursive: true });

      // Generate a unique filename
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
      const extension = path.extname(thumbnailFile.name);
      const filename = `${thumbnailFile.name.replace(extension, '')}-${uniqueSuffix}${extension}`;
      const filePath = path.join(uploadDir, filename);

      // Convert ArrayBuffer to Buffer and write the file
      const buffer = Buffer.from(await thumbnailFile.arrayBuffer());
      await writeFile(filePath, buffer);

      // Set the thumbnailUrl relative to the public directory
      thumbnailUrl = `/images/${filename}`;
    }

    const newSite: Site = {
      id: randomUUID(),
      name: name,
      link: link,
      description: description,
      thumbnailUrl: thumbnailUrl, // Use the generated URL or undefined
    };

    const sites = await getAllSites();
    sites.push(newSite);
    await saveAllSites(sites);

    return NextResponse.json(newSite, { status: 201 }); // 201 Created
  } catch (error) {
    console.error('API POST /api/sites Error:', error);
    // Handle potential errors during file processing or other issues
    return NextResponse.json({ message: 'Failed to create site' }, { status: 500 });
  }
}
