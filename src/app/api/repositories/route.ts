import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getGithUser } from '@/lib/gith-config';

// GET /api/repositories - List user's repositories
export async function GET() {
  try {
    const githUser = await getGithUser();
    
    if (!githUser?.email) {
      return NextResponse.json({ error: 'No user configured in gith config. Run: gith config user.email <email>' }, { status: 401 });
    }

    // Get user by email to get the ID
    const user = await prisma.user.findUnique({
      where: { email: githUser.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const repositories = await prisma.repository.findMany({
      where: {
        ownerId: user.id
      },
      include: {
        owner: {
          select: {
            name: true,
            email: true
          }
        },
        _count: {
          select: {
            commits: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    return NextResponse.json(repositories);
  } catch (error) {
    console.error('Error fetching repositories:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/repositories - Create a new repository
export async function POST(request: NextRequest) {
  try {
    const githUser = await getGithUser();
    
    if (!githUser?.email) {
      return NextResponse.json({ error: 'No user configured in gith config. Run: gith config user.email <email>' }, { status: 401 });
    }

    // Get user by email to get the ID
    const user = await prisma.user.findUnique({
      where: { email: githUser.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { name, description, isPrivate = false } = await request.json();

    if (!name) {
      return NextResponse.json({ error: 'Repository name is required' }, { status: 400 });
    }

    // Check if repository already exists
    const existing = await prisma.repository.findFirst({
      where: {
        ownerId: user.id,
        name: name
      }
    });

    if (existing) {
      return NextResponse.json({ error: 'Repository already exists' }, { status: 409 });
    }

    const repository = await prisma.repository.create({
      data: {
        name,
        description,
        isPrivate,
        ownerId: user.id
      },
      include: {
        owner: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    // Create default main branch
    await prisma.branch.create({
      data: {
        name: 'main',
        repositoryId: repository.id
      }
    });

    return NextResponse.json(repository, { status: 201 });
  } catch (error) {
    console.error('Error creating repository:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}