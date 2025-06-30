import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import dbconnect from "@/app/DBConnection";

export async function POST(req) {
  try {
    await dbconnect();

    const { name, mail, message, request } = await req.json();
    console.log( name, mail, message, request )

    if (!name || !mail || !message) {
      return NextResponse.json({ message: "Fields absent" }, { status: 400 });
    }

    const transporter = nodemailer.createTransport({
    service: 'gmail',
      auth: {
        user: process.env.AUTH,
        pass: process.env.PASSWORD,
      },
    });
    const info = await transporter.sendMail({
        from: `"${name}" <${process.env.AUTH}>`, 
        to: process.env.AUTH,                    
        subject: request,
        text: message,
        replyTo: mail,                         
      });
    return NextResponse.json({
      message: "We will contact you soon!!",
    });
  } catch (error) {
    console.error("❌ Email error:", error);
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}
