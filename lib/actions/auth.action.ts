"use server";
// server render file

import { auth, db } from "@/firebase/admin";
import { Decipher } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";

const ONE_WEEK = 60 * 60 * 24 * 7

// sign up
export async function signUp(params : SignUpParams) {
  const {uid , name , email} = params;

  try {
    
    const userRecord = await db.collection('users').doc(uid).get();

    if(userRecord.exists){
      return {
        message : 'User already exists!! Please Sign In',
        success: false,
      }
    }

    // doesnt exists
    await db.collection('users').doc(uid).set({
      name,email
    })

    return {
      success: true,
      message: "User Signed Up Successfully"
    }

  } catch (error:any) {

    if(error.code === 'auth/email-already-exists'){
      return {
        message: 'This Email already exists',
        success: false
      }
    } 

    return {
      error:error.message,
      message: "Failed To create the User",
      success: false
    }
  }
}

// sign in
export async function signIn(params:SignInParams) {
  const {email , idToken} = params;

  try {
    
    const userRec = await auth.getUserByEmail(email);

    if(!userRec){
      return{
        success: false,
        messgae : "User Not Exist..  Please create The Account"
      }
    }

    await setSessionCookie(idToken);

  } catch (e) {
    console.log(e)

    return {
      success: false,
      message: "Something Went Wrong" ,
    }
  }
}

// token and cookies
export async function setSessionCookie(idToken: string) {
  const cookieStore = await cookies();

  const sessionCookie = await auth.createSessionCookie(idToken,{
    expiresIn: ONE_WEEK * 1000,  
  })

  cookieStore.set('session' , sessionCookie ,{
    maxAge: ONE_WEEK,
    httpOnly : true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    sameSite: 'lax'
  })

}

// get current User
export async function getCurrentUser() : Promise<User | null> {
  const cookieStore = await cookies();

  const sessionCookie = cookieStore.get('session')?.value;

  if(!sessionCookie) return null;

  try {
    
    const decodedClaims = await auth.verifySessionCookie(sessionCookie,true);

    const userRec = await db.collection('users').doc(decodedClaims.uid).get();

    if(!userRec.exists) return null;

    return {
      ... userRec.data(),
      id: userRec.id,
    } as User

  } catch (error) {
    console.log(error)
    return null;
  }
}

//  is authenticated
export async function isAuthenticated() {
  const user = await getCurrentUser();

  return !!user;
}

// get interview questions by user id from firebase
export async function getInterviewByUserId(userid:string) : Promise<Interview[] | null >{

  if(!userid){
    return null;  // Or return [] based on your UI handling
  }

  const interviewQuestion = await db
    .collection('interviews')
    .where("userId", '==', userid)
    .orderBy('createdAt', 'desc')
    .get();

  if(interviewQuestion.empty) return [];

  return interviewQuestion.docs.map((doc)=>({
    id: doc.id,
    ...doc.data(),
  })) as Interview[]
}

export async function getLatestInterview(params: GetLatestInterviewsParams) : Promise< Interview[] | null > {

  const {userId, limit =20} = params;

  const interviewQuestion = await db
    .collection('interviews')
    .orderBy('createdAt', 'desc')
    .where("finalized", '==', true)
    .where('userId' ,"!=",userId)
    .limit(limit)
    .get();
  
  return interviewQuestion.docs.map((doc)=>({
    id: doc.id,
    ...doc.data(),
  })) as Interview[]
}

export async function signOut() {
  try {
    const cookieStore = await cookies();

    // set the token to empty
    cookieStore.set('session','',{
      maxAge: 0,
      path: '/'
    })

    redirect('/signin');

    return new Response('Logged Out', { status: 200 })
  } catch (error) {
    console.log(error);
    
  }
}