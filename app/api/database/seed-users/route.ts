// This file is deprecated and will be removed.
// User seeding functionality has been consolidated into the main seed endpoint.

import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({
    success: false,
    message: "This endpoint has been deprecated. Please use /api/database/seed instead."
  }, { status: 410 }); // 410 Gone status code
}