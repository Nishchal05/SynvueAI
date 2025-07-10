import { NextResponse } from "next/server";
import usermodal from "@/app/modal/usermodal";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("interviewid")?.trim();
    const email = searchParams.get("mail");
    if (!email || !id) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }
    const result = await usermodal.findOne({ email });
    if (!result) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const interviewDataObj = result?.interviews?.interviewData;
    const interview = interviewDataObj?.get(id);
    return NextResponse.json({
      name: result.name,
      minutes:result.minutes,
      interviewdetails: interview || {},
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
