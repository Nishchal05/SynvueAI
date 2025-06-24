import { NextResponse } from "next/server";
import usermodal from "@/app/modal/usermodal";
import dbconnect from "@/app/DBConnection";

export async function GET(req) {
  try {
    await dbconnect
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("useremail");
    const interviewId = searchParams.get("interviewId");
    if (!email || !interviewId) {
      return NextResponse.json(
        { error: "Missing query parameters" },
        { status: 400 }
      );
    }

    const user = await usermodal.findOne({ email });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const interview = user?.interviews?.interviewData?.get(interviewId);
    if (!interview) {
      return NextResponse.json({ error: "Interview not found" }, { status: 404 });
    }

    return NextResponse.json({ interview, username: user.name });

  } catch (error) {
    console.error("GET Interview Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
