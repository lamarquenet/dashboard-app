import { NextRequest, NextResponse } from 'next/server';
import { getAllSites, saveAllSites } from '@/lib/data-access/sites';
import { Site } from '@/types';
import { writeFile, mkdir } from 'fs/promises'; // Import fs/promises for async file operations
import path from 'path'; // Import path for handling file paths

// PUT /api/sites/[id]
export async function PUT(request: NextRequest, { params } : { params: Promise<{ id: string }> }) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ message: 'Site ID is required for update' }, { status: 400 });
  }

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

    const sites = await getAllSites();
    const siteIndex = sites.findIndex((site) => site.id === id);

    if (siteIndex === -1) {
      return NextResponse.json({ message: `Site with ID ${id} not found` }, { status: 404 });
    }

    const existingSite = sites[siteIndex];
    let thumbnailUrl = existingSite.thumbnailUrl; // Default to existing URL

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

      // Optional: Delete the old image file if it exists and is different
      // if (existingSite.thumbnailUrl && existingSite.thumbnailUrl !== thumbnailUrl) {
      //   try {
      //     const oldFilePath = path.join(process.cwd(), 'public', existingSite.thumbnailUrl);
      //     await unlink(oldFilePath); // Requires importing unlink from fs/promises
      //   } catch (unlinkError) {
      //     console.error(`Failed to delete old thumbnail ${existingSite.thumbnailUrl}:`, unlinkError);
      //     // Don't block the update if deletion fails
      //   }
      // }
    }

    const updatedSite: Site = {
      ...existingSite, // Keep existing ID and other potential fields
      name: name,
      link: link,
      description: description,
      thumbnailUrl: thumbnailUrl, // Use new or existing URL
    };

    sites[siteIndex] = updatedSite;
    await saveAllSites(sites);

    return NextResponse.json(updatedSite);
  } catch (error) {
    console.error(`API PUT /api/sites/${id} Error:`, error);

    // Handle potential errors during file processing or other issues
    return NextResponse.json({ message: 'Failed to update site' }, { status: 500 });
  }
}

// DELETE /api/sites/[id]
export async function DELETE(request: NextRequest, { params } : { params: Promise<{ id: string }> }) {
  const { id } = await params; // Get the ID from the params object

  if (!id) {
    return NextResponse.json({ message: 'Site ID is required for deletion' }, { status: 400 });
  }

  try {
    const sites = await getAllSites();
    const siteIndex = sites.findIndex((site) => site.id === id);

    if (siteIndex === -1) {
      return NextResponse.json({ message: `Site with ID ${id} not found` }, { status: 404 });
    }

    const updatedSites = sites.filter((site) => site.id !== id);
    await saveAllSites(updatedSites);

    return new NextResponse(null, { status: 204 }); // 204 No Content
  } catch (error) {
    console.error(`API DELETE /api/sites/${id} Error:`, error);
    return NextResponse.json({ message: 'Failed to delete site' }, { status: 500 });
  }
}
