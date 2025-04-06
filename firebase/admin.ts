import { getApps, initializeApp ,cert } from "firebase-admin/app"
import {getAuth} from "firebase-admin/auth"
import {getFirestore} from "firebase-admin/firestore"

const initFireBaseAdmin = () =>{
    const apps = getApps();

    if(!apps.length){
        initializeApp({
            credential : cert({
                projectId : process.env.FIREBASE_PROJECT_ID,
                privateKey: process.env.FIREBASE_PRIVATE_KEY,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL?.replace(/\\n/g, "\n")
            })
        })
    }

    return {
        auth : getAuth(),
        db : getFirestore()
    }
}

export const {auth ,db} = initFireBaseAdmin();