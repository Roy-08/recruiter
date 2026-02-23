import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import {connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { firstName, lastName, company } = await req.json();

  await connectDB();

  await User.findOneAndUpdate(
    { email: session.user.email },
    {
      name: `${firstName} ${lastName}`,
      company,
    },
    { upsert: true }
  );

  return NextResponse.json({ success: true });
}
