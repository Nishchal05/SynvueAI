const { NextResponse } = require("next/server");
import User from '@/app/modal/usermodal';
import dbconnect from "@/app/DBConnection";
export async function POST(req) {
  await dbconnect();
  try {
    const { user } = await req.json();

    if (!user) {
      return NextResponse.json({ message: 'Missing credentials!!' }, { status: 400 });
    }

    const existingUser = await User.findOne({ email: user?.primaryEmailAddress?.emailAddress });

    if (existingUser) {
      return NextResponse.json({ message: 'User already exists',user: existingUser}, { status: 200 });
    }

    const createuser = await User.create({
      name: user?.fullName,
      email: user?.primaryEmailAddress?.emailAddress
    });

    return NextResponse.json({ message: 'User created', user: createuser }, { status: 201 });

  } catch (error) {
    console.error('Error in creating user:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
export async function GET(req) {
  await dbconnect();

  try {
    const url = new URL(req.url);
    const email = url.searchParams.get("email");

    if (!email) {
      return NextResponse.json({ message: 'Missing email in query!!' }, { status: 400 });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return NextResponse.json({ user: existingUser }, { status: 200 });
    } else {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
export async function PUT(req) {
  try {
    const { minutes, email } = await req.json();

    if (!minutes || !email) {
      return NextResponse.json({ message: "Credential missing!" }, { status: 400 });
    }

    const response = await User.findOneAndUpdate(
      { email },
      { $set: { minutes: Number(minutes) } },
      { new: true }
    );
    console.log(response)

    if (response) {
      return NextResponse.json({ message: "Update successful" }, { status: 200 });
    } else {
      return NextResponse.json({ message: "Update not successful" }, { status: 404 });
    }
  } catch (error) {
    console.error("❌ Update error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}