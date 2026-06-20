/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, react/no-unescaped-entities */
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { prisma } from '@/lib/prisma';
export async function POST(request) {
  const {
    email,
    name,
    password
  } = await request.json();
  if (!email || !name || !password) {
    return NextResponse.json({
      error: 'Missing required fields'
    }, {
      status: 400
    });
  }
  if (password.length < 8) {
    return NextResponse.json({
      error: 'Password must be at least 8 characters'
    }, {
      status: 400
    });
  }
  const supabase = await createClient();
  const {
    data,
    error
  } = await supabase.auth.signUp({
    email,
    password
  });
  if (error) return NextResponse.json({
    error: error.message
  }, {
    status: 400
  });
  const supabaseAdmin = createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

  // Auto-confirm the user so they can log in immediately
  await supabaseAdmin.auth.admin.updateUserById(data.user.id, {
    email_confirm: true
  });

  // Create user record in our DB
  try {
    await prisma.user.create({
      data: {
        id: data.user.id,
        email,
        name
      }
    });
  } catch (err) {
    // If user already exists in Prisma but signed up in Supabase (or other db error), rollback auth
    const supabaseAdmin = createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    await supabaseAdmin.auth.admin.deleteUser(data.user.id);
    return NextResponse.json({
      error: 'Failed to create user record'
    }, {
      status: 400
    });
  }

  // Actually sign them in to establish the session cookie
  const {
    error: signInError
  } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  if (signInError) {
    return NextResponse.json({
      error: 'Failed to sign in after registration'
    }, {
      status: 400
    });
  }
  return NextResponse.json({
    user: {
      id: data.user.id,
      email,
      name
    }
  }, {
    status: 201
  });
}